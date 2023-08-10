// package main implements a graph data migration tool to be used from the
// command line.
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/twpayne/go-geom/encoding/geojson"
	"github.com/yuin/goldmark"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/types/known/durationpb"
	"google.golang.org/protobuf/types/known/timestamppb"

	"github.com/geomodulus/citygraph"
	graphdb "github.com/geomodulus/citygraph/db"
	feedpb "github.com/geomodulus/citygraph/feed_producer/pb"
)

func main() {
	citygraphAddr := flag.String("citygraph-addr", "127.0.0.1:27615", "address string for citygraph indradb GRPC server")
	feedProducerAddr := flag.String("feed-producer-addr", "127.0.0.1:3550", "address string for feed producer GRPC server")
	articlesDir := flag.String("articles-dir", "articles", "directory with the actual content in it.")

	flag.Parse()

	ctx := context.Background()

	// Linting requires no resources so we do it up here.
	if flag.Arg(0) == "lint" {
		log.Println("Linting articles:")
		if err := lintArticles(ctx, *articlesDir); err != nil {
			log.Fatal(err)
		}
		return
	}

	graphConn, err := grpc.Dial(*citygraphAddr, grpc.WithInsecure())
	if err != nil {
		log.Fatal(err)
	}
	defer graphConn.Close()

	var feedClient feedpb.FeedProducerClient
	feedConn, err := grpc.Dial(*feedProducerAddr, grpc.WithInsecure())
	if err != nil {
		log.Fatal(err)
	}
	defer feedConn.Close()
	feedClient = feedpb.NewFeedProducerClient(feedConn)

	graphClient := citygraph.NewClient(graphConn)
	store := &graphdb.Store{GraphClient: graphClient}

	switch flag.Arg(0) {

	case "articles":
		if slug := flag.Arg(1); slug != "" {
			log.Printf("Processing article %q:", slug)
			dir := filepath.Join(*articlesDir, slug)
			processArticle(ctx, store, feedClient, dir)
		} else {
			log.Println("Processing all existing articles:")
			if _, err := processArticles(ctx, store, feedClient, *articlesDir); err != nil {
				log.Fatalf("error processing articles: %v", err)
			}
		}

	case "":
		log.Println("Processing articles:")
		processArticles(ctx, store, feedClient, *articlesDir)
	}

}

func lintArticles(_ context.Context, dir string) error {
	contents, err := os.ReadDir(dir)
	if err != nil {
		return fmt.Errorf("os.ReadDir: %v", err)
	}
	var foundErr bool
	for _, entry := range contents {
		if entry.IsDir() {
			path := filepath.Join(dir, entry.Name())

			article, err := readArticle(path)
			if err != nil {
				foundErr = true
				log.Printf("[error] reading article at %s: %v", path, err)
			}
			if _, err := article.UUID(); err != nil {
				foundErr = true
				log.Printf("[error] article missing UUID at %s: %v", path, err)
			}
			if article.Name == "" {
				foundErr = true
				log.Printf("[error] article missing headline/display name at %s: %v", path, err)
			}
			if _, err := os.ReadFile(filepath.Join(path, "article.html")); err != nil {
				foundErr = true
				log.Printf("[error] article missing article.html at %s: %v", path, err)
			}
			if _, err := os.ReadFile(filepath.Join(path, "article.js")); err != nil {
				foundErr = true
				log.Printf("[error] article missing article.js at %s: %v", path, err)
			}
			if article.Promo != "" {
				if _, err := os.ReadFile(filepath.Join(path, "promo.html")); err != nil {
					foundErr = true
					log.Printf("[error] article missing expected promo.html at %s: %v", path, err)
				}
			}
			for _, dataset := range article.GeoJSONDatasets {
				if _, err := dataset.UUID(); err != nil {
					foundErr = true
					log.Printf("[error] article dataset missing UUID at %s: %v", path, err)
				}
			}

			log.Printf("- %s", path)
		}
	}
	if foundErr {
		return errors.New("articles failed lint")
	}
	return nil
}

func readArticles(dirs ...string) ([]*citygraph.Article, error) {
	var articles []*citygraph.Article

	for _, dir := range dirs {
		contents, err := os.ReadDir(dir)
		if err != nil {
			return nil, fmt.Errorf("os.ReadDir: %v", err)
		}
		for _, entry := range contents {
			if entry.IsDir() {
				article, err := readArticle(filepath.Join(dir, entry.Name()))
				if err != nil {
					return nil, fmt.Errorf("error reading article %q: %v", filepath.Join(dir, entry.Name()), err)
				}
				articles = append(articles, article)
			}
		}
	}

	return articles, nil
}

func readArticle(path string) (*citygraph.Article, error) {
	if _, err := os.Stat(filepath.Join(path, "article.json")); err != nil {
		return nil, fmt.Errorf("no article.json found in path %q", path)
	}
	metaBytes, err := os.ReadFile(filepath.Join(path, "article.json"))
	if err != nil {
		return nil, fmt.Errorf("can't read article.json for %q", path)
	}
	article := &citygraph.Article{
		LoadedFrom: path,
	}
	if err := json.Unmarshal(metaBytes, article); err != nil {
		return nil, fmt.Errorf("can't parse article.json for %q: %v", path, err)
	}
	article.LoadedFrom = path
	if article.Slug == "" {
		article.Slug = filepath.Base(path)
	}
	return article, nil
}

func processArticles(ctx context.Context, store *graphdb.Store, feedClient feedpb.FeedProducerClient, dir string) ([]*citygraph.Article, error) {
	contents, err := os.ReadDir(dir)
	if err != nil {
		return nil, fmt.Errorf("os.ReadDir: %v", err)
	}
	var articles []*citygraph.Article
	for _, entry := range contents {
		if entry.IsDir() {
			info, err := entry.Info()
			if err != nil {
				return nil, fmt.Errorf("error getting info for %q: %v", filepath.Join(dir, entry.Name()), err)
			}
			log.Printf("   %s: %s", entry.Name(), info.ModTime().Format(time.RFC3339))
			article, err := processArticle(ctx, store, feedClient, filepath.Join(dir, entry.Name()))
			if err != nil {
				return nil, fmt.Errorf("error processing article %q: %v", filepath.Join(dir, entry.Name()), err)
			}
			articles = append(articles, article)
		}
	}

	if err := store.WriteArticleListings(ctx, store, articles); err != nil {
		return nil, fmt.Errorf("error writing torontoverse latest: %v", err)
	}

	return articles, nil
}

func processArticle(ctx context.Context, store *graphdb.Store, feedClient feedpb.FeedProducerClient, path string) (*citygraph.Article, error) {
	article, err := readArticle(path)
	if err != nil {
		return nil, fmt.Errorf("error reading article: %v", err)
	}

	var headHTML bytes.Buffer
	if err := goldmark.Convert(append([]byte("# "), []byte(article.Name)...), &headHTML); err != nil {
		return nil, fmt.Errorf("error converting markdown: %v", err)
	}
	article.Headline = headHTML.String()

	store.WriteArticle(ctx, article)

	id, err := article.UUID()
	if err != nil {
		return nil, fmt.Errorf("error parsing UUID: %v", err)
	}

	q, err := article.VertexQuery()
	if err != nil {
		return nil, fmt.Errorf("error generating vertex query: %v", err)
	}
	body, err := readBodyText(path)
	if err != nil {
		return nil, fmt.Errorf("error reading article body: %v", err)
	}
	store.WriteBodyText(ctx, q, body)

	fn, err := os.ReadFile(filepath.Join(path, "article.js"))
	if err != nil {
		return nil, fmt.Errorf("error reading article js: %v", err)
	}
	store.WriteJS(ctx, q, string(fn))

	if _, err := os.Stat(filepath.Join(path, "teaser.geojson")); !os.IsNotExist(err) {
		teaserBytes, err := os.ReadFile(filepath.Join(path, "teaser.geojson"))
		if err != nil {
			return nil, fmt.Errorf("error reading article teaser geojson: %v", err)
		}
		var teaser map[string]interface{}
		if err := json.Unmarshal(teaserBytes, &teaser); err != nil {
			return nil, fmt.Errorf("error unmarshaling article teaser geojson: %v", err)
		}
		store.WriteTeaserGeoJSON(ctx, q, teaser)
	}

	if _, err := os.Stat(filepath.Join(path, "teaser.js")); !os.IsNotExist(err) {
		fn, err := os.ReadFile(filepath.Join(path, "teaser.js"))
		if err != nil {
			return nil, fmt.Errorf("error reading article teaser js: %v", err)
		}
		store.WriteTeaserJS(ctx, q, string(fn))
	}

	for _, dataset := range article.GeoJSONDatasets {
		if dataset.Render == "auto" {
			q, err := dataset.VertexQuery()
			if err != nil {
				return nil, fmt.Errorf("error generating dataset vertex query: %v", err)
			}
			jsString := fmt.Sprintf("module.displayFeatures(%q, feature);", dataset.Name)
			store.WriteJS(ctx, q, jsString)
		} else {
			fn, err := os.ReadFile(filepath.Join(path, dataset.Name+".js"))
			if err != nil {
				return nil, fmt.Errorf("error reading dataset js: %v", err)
			}
			dq, err := dataset.VertexQuery()
			if err != nil {
				return nil, fmt.Errorf("error generating dataset vertex query: %v", err)
			}
			store.WriteJS(ctx, dq, string(fn))
		}

		if dataset.URL != "" {
			store.WriteArticleGeoJSONDataset(ctx, id, dataset)
			continue
		}

		datasetDataBytes, err := os.ReadFile(filepath.Join(path, dataset.Name+".geojson"))
		if err != nil {
			return nil, fmt.Errorf("error reading dataset geojson: %v", err)
		}
		data := &geojson.FeatureCollection{}
		if err := data.UnmarshalJSON(datasetDataBytes); err != nil {
			return nil, fmt.Errorf("error parsing dataset geojson: %v", err)
		}
		store.WriteArticleGeoJSONDatasetWithData(ctx, id, dataset, data)
	}

	if feedClient != nil {
		if err := sendArticleToFeedProducer(ctx, feedClient, article); err != nil {
			return nil, fmt.Errorf("error sending article to feed producer: %v", err)
		}
	}

	log.Printf("- %s", path)

	return article, nil
}

func sendArticleToFeedProducer(ctx context.Context, feedClient feedpb.FeedProducerClient, article *citygraph.Article) error {
	if article.PromoAt.IsZero() &&
		article.PromoUntil.IsZero() &&
		article.PromoExpires.IsZero() {
		return nil
	}

	if (article.PromoAt != time.Time{} && time.Now().Before(article.PromoAt)) {
		return nil
	}

	var (
		wait     = article.PromoWait
		unsetDur = citygraph.Duration{Duration: 0}
	)

	if wait == unsetDur {
		wait = citygraph.Duration{Duration: 90 * time.Minute}
	}
	req := &feedpb.AddContentRequest{
		ContentType: feedpb.ContentType_ARTICLE,
		Id:          article.ID,
		Wait:        durationpb.New(wait.Duration),
		Until:       timestamppb.New(article.PromoUntil),
	}
	if (article.PromoExpires != time.Time{}) {
		req.Expires = timestamppb.New(article.PromoExpires)
	}
	if _, err := feedClient.AddContent(ctx, req); err != nil {
		return fmt.Errorf("can't add to feed producer: %v", err)
	}

	return nil
}

func readBodyText(path string) (string, error) {
	body, err := os.ReadFile(filepath.Join(path, "article.html"))
	if err != nil {
		return "", fmt.Errorf("error reading article body: %v", err)
	}
	return string(body), nil
}
