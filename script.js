const status = document.getElementById("status");
const mainContainer = document.getElementById("siteList");
let filter = "all";

const filterProviders = () => {
  $("li").each(function () {
    const siteValues = $(this).find(".siteValues").text().toLowerCase();
    $(this).toggle(filter === "all" || siteValues.includes(filter.toLowerCase()));
  });
};

$("input[name='filter']").on("change", function () {
  filter = this.value;
  filterProviders();
});

$(document).ready(() => {
  status.innerHTML = "Fetching...";
  $.getJSON("https://cdn.jsdelivr.net/gh/OshekharO/Web-Indexer@main/providers.json")
    .done((data) => {
      status.innerHTML = "Parsing...";
      Object.entries(data).forEach(([key, value]) => {
        status.innerHTML = "Reading..." + key;
        if (value.url === "NONE") return;
        const { status: _status, icon: _thumbNail = "default_image_url" } = value;
        const node = document.createElement("li");
        const _divMain = document.createElement("div");
        const _divImg = document.createElement("div");
        const _divText = document.createElement("div");
        const _img = document.createElement("img");
        _img.className = "thumbnail";
        _img.src = _thumbNail;
        _img.alt = "icon";
        _img.loading = "lazy";
        _img.onerror = () => { _img.src = "default_image_url"; };
        _divImg.className = "divthumb";
        _divImg.appendChild(_img);
        _divMain.appendChild(_divImg);
        const _a = document.createElement("a");
        _a.setAttribute("href", value.url);
        _a.innerHTML = value.name;
        _a.title = key;
        _a.style.color = "#fff";
        _a.className = "siteName";
        _divText.appendChild(_a);
        const _p = document.createElement("p");
        _p.innerHTML = "Type: ";
        _p.className = "siteLabels";
        const _span = document.createElement("span");
        _span.className = "siteValues";
        const types = ["NSFW", "MANGA", "LN", "MOVIE", "APP", "ANIME"];
        const statusText = types[_status] || "Unknown";
        const statusColor = ["#e57373", "#8bc34a", "#ffc107", "#64b5f6", "#64b5f6", "#64b5f6"][_status] || "#eee";
        _span.style.color = statusColor;
        _span.textContent = statusText;
        _p.appendChild(_span);
        _divText.appendChild(_p);
        if (value.type) {
          const _pType = document.createElement("p");
          _pType.innerHTML = "Type: ";
          _pType.className = "siteLabels";
          const _spanType = document.createElement("span");
          _spanType.className = "siteValues";
          _spanType.textContent = value.type;
          _pType.appendChild(_spanType);
          _divText.appendChild(_pType);
        }
        _divText.className = "divcaption";
        _divMain.appendChild(_divText);
        _divMain.className = "divMainContainer";
        node.appendChild(_divMain);
        mainContainer.appendChild(node);
      });
      status.innerHTML = "Done loading!";
    })
    .fail(() => {
      console.log("An error has occurred.");
      status.innerHTML = "Error occurred!";
    });
});
