/** Original Code from https://github.com/Iku/Google-Forms-to-Discord **/

// Webhook links
var POST_URLS = [];

function onSubmit(e) {
    var form = FormApp.getActiveForm();
    var allResponses = form.getResponses();
    var latestResponse = allResponses[allResponses.length - 1];
    var response = latestResponse.getItemResponses();
    var items = [];

    for (var i = 0; i < response.length; i++) {
        var question = response[i].getItem().getTitle();
        var answer = response[i].getResponse();
        try {
            var parts = answer.match(/[\s\S]{1,1024}/g) || [];
        } catch (e) {
            var parts = answer;
        }

        if (answer == "") {
            continue;
        }
        for (var j = 0; j < parts.length; j++) {
            if (j == 0) {
                items.push({
                    "name": question,
                    "value": parts[j],
                    "inline": true
                });
            } else {
                items.push({
                    "name": question.concat(" (cont.)"),
                    "value": parts[j],                  
                    "inline": true
                });
            }
        }
    }

    // Delete the Status question since it's always ~
    items = items.filter(q => q.name !== "Status");

    // Rename the Extra Details question because it's very long and looks ugly in the discord embed
    var extraDetailsItem = items.find(q => q.name.toLowerCase().includes("extra details"));
    extraDetailsItem.name = "Extra Details";

    // Send 2 messages. The first is an embed containing all submission details except proof
    //  The second is just the proof link, as content not an embed.
    //    This allows discord to display its own embed preview, better than the embed image method.
    //    Currently, imgur album links don't preview at all and youtube links are just images no playable video.
    //    This method fixes that.
    
    // submitted proof link
    var proofUrl = items.find(q => q.name === "Proof").value || "";

    var embedMessageOptions = {
        "method": "post",
        "headers": {
            "Content-Type": "application/json",
        },
        "payload": JSON.stringify({
            "embeds": [{
                "fields": items,
                "color": 0xF0C142, // This is still a hex color, just replace the # with 0x to make it a valid js number
            }]
        })
    };

    var linkPreviewMessageOptions = {
      "method": "post",
      "headers": {
          "Content-Type": "application/json",
      },
      "payload": JSON.stringify({
          "content": proofUrl,
      })
    }

    POST_URLS.forEach(url => {
      UrlFetchApp.fetch(url, embedMessageOptions);
      UrlFetchApp.fetch(url, linkPreviewMessageOptions);
    });
};
