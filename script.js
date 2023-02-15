//Load all providers from json file

var status = document.getElementById("status");

var mainContainer = document.getElementById("siteList");

var filter = "all";

status.innerHTML = "Fetching...";

function checkSiteStatus(url, callback) {
  $.ajax({
    type: 'HEAD',
    url: url,
    success: function() {
      callback(true);
    },
    error: function() {
      callback(false);
    }
  });
}

function filterProviders() {
 $("li").each(function () {
  if (filter === "all") {
   $(this).show();
  } else if (
   $(this)
    .find(".siteValues")

    .text()

    .toLowerCase()

    .indexOf(filter.toLowerCase()) === -1
  ) {
   $(this).hide();
  } else {
   $(this).show();
  }
 });
}

$("input[name='filter']").on("change", function () {
 filter = this.value;

 filterProviders();
});

$(document).ready(function () {
 $.getJSON("https://raw.githubusercontent.com/OshekharO/Web-Indexer/main/providers.json", function (data) {
  status.innerHTML = "Parsing...";

  for (var key in data) {

    checkSiteStatus(value.url, function(isWorking) {
    value.isWorking = isWorking;
    });

   status.innerHTML = "Reading..." + key;

   if (data.hasOwnProperty(key)) {
    var value = data[key];

    if (value.url == "NONE") {
     continue;
    }

    var _status = value.status;

    var _thumbNail = value.url.trimRight("/") + "/favicon.ico";

    //Use defaut image if missing

    if (value.hasOwnProperty("icon")) {
     _thumbNail = value.icon;
    }

    //Create <li> node

    var node = document.createElement("li");

    //Add <div> to <li> node for items

    var _divMain = document.createElement("div"); //group below divs

    var _divImg = document.createElement("div"); //for image Thumbnail

    var _divText = document.createElement("div"); //for sitename + status

    var _img = document.createElement("img"); //Image thumbnail

    //Add image

    _img.className = "thumbnail";

    _img.style.content = "";

    _img.src = _thumbNail;

    _img.loading = "lazy"; // Add this line to enable lazy loading

    _img.onerror = function () {
     _img.src = "https://via.placeholder.com/150"; // Use a default image if loading fails
    };

    //_img.src = "https://via.placeholder.com/150";

    //_img.src = value.url.trimRight("/") + "/favicon.ico";

    //Modify _divImg

    _divImg.className = "divthumb";

    _divImg.appendChild(_img);

    _divMain.appendChild(_divImg);

    //Add siteName hyperlink text

    var _a = document.createElement("a");

    _a.setAttribute("href", value.url);

    _a.innerHTML = value.name;

    _a.title = key;

    _a.style.color = "#fff";

    _a.className = "siteName";

    _divText.appendChild(_a);

    //Add status label

    var _p = document.createElement("p");

    _p.innerHTML = "Type: ";

    _p.className = "siteLabels";

    //Add status from json

    var _span = document.createElement("span");

    _span.className = "siteValues";

    var _statusText = "Unknown";

    var _statusColor = "#eee";

    switch (_status) {
     case 0:
      _statusText = "NSFW";

      _statusColor = "#e57373";

      break;

     case 1:
      _statusText = "MANGA";

      _statusColor = "#8bc34a";

      break;

     case 2:
      _statusText = "LN";

      _statusColor = "#ffc107";

      break;

     case 3:
      _statusText = "MOVIE";

      _statusColor = "#64b5f6";

      break;

     case 4:
      _statusText = "APP";

      _statusColor = "#64b5f6";

      break;

     case 5:
      _statusText = "ANIME";

      _statusColor = "#64b5f6";

         break;
  default:
    if (value.isWorking === false) {
      _statusText = "DOWN";
      _statusColor = "#f44336";
    } else {
      _statusText = "Unknown";
      _statusColor = "#eee";
    }
    break;
}

    _span.style.color = _statusColor;

    _span.textContent = _statusText;

    _p.appendChild(_span);

    //Add (status + status label) to _divText

    _divText.appendChild(_p);

    //Add type, if it exists

    if (value.hasOwnProperty("type")) {
     var _pType = document.createElement("p");

     _pType.innerHTML = "Type: ";

     _pType.className = "siteLabels";

     var _spanType = document.createElement("span");

     _spanType.className = "siteValues";

     _spanType.textContent = value.type;

     _pType.appendChild(_spanType);

     _divText.appendChild(_pType);
    }

    //Add all texts for entry

    _divText.className = "divcaption";

    _divMain.appendChild(_divText);

    //Add main container to node

    _divMain.className = "divMainContainer";

    node.appendChild(_divMain);

    //Add <li> to <ul> siteList

    mainContainer.appendChild(node);
   }
  }
 }).fail(function () {
  console.log("An error has occurred.");

  status.innerHTML = "Error occured!";
 });
});

status.innerHTML = "Done loading!";
