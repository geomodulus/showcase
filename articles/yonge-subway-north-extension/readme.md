# North to Richmond Hill: Breaking down the 8-km Yonge subway extension

**Code and markup by Kyle Duncan**

This article uses Torontoverse's `SceneList` module to direct the user to particular elements of the map visualisation at key points in the article scroll.

It fetches geojson data for the existing and proposed sections of TTC Line 1, and also for two connected major bus and train lines, GO and Viva BRT, and adds those to the map. It programatically builds a legend, identifying the different lines, stops, transit hubs or portals, and grade levels of the proposed extension.

Finally, the particular scenes are created and connected to elements in the article that will be triggered using the [Scroll Magic](http://scrollmagic.io/) plugin.

---

_Article written by [Reece Martin](https://rmtransit.com/)_
