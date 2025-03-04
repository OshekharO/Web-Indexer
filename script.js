document.addEventListener("DOMContentLoaded", function () {
    const status = document.getElementById("status");
    const mainContainer = document.getElementById("siteList");
    let filter = "all";

    status.innerHTML = "Fetching...";

    function filterProviders() {
        document.querySelectorAll("li").forEach(function (li) {
            const siteValues = li.querySelector(".siteValues").textContent.toLowerCase();
            if (filter === "all" || siteValues.includes(filter.toLowerCase())) {
                li.style.display = "";
            } else {
                li.style.display = "none";
            }
        });
    }

    document.querySelectorAll("input[name='filter']").forEach(function (radio) {
        radio.addEventListener("change", function () {
            filter = this.value;
            filterProviders();
        });
    });

    fetch("https://raw.githack.com/OshekharO/Web-Indexer/main/providers.json")
        .then(response => response.json())
        .then(data => {
            status.innerHTML = "Parsing...";

            Object.keys(data).forEach(key => {
                status.innerHTML = "Reading..." + key;
                const value = data[key];

                if (value.url === "NONE") continue;

                const _status = value.status;
                let _thumbNail = value.icon || "https://cdn-cmlep.nitrocdn.com/DLSjJVyzoVcUgUSBlgyEUoGMDKLbWXQr/assets/images/optimized/rev-ea26883/www.stellarinfo.com/images/v7/dmca.png";

                const node = document.createElement("li");
                const _divMain = document.createElement("div");
                const _divImg = document.createElement("div");
                const _divText = document.createElement("div");
                const _img = document.createElement("img");

                _img.className = "thumbnail";
                _img.src = _thumbNail;
                _img.alt = "icon";
                _img.loading = "lazy";
                _img.onerror = function () {
                    _img.src = "https://cdn-cmlep.nitrocdn.com/DLSjJVyzoVcUgUSBlgyEUoGMDKLbWXQr/assets/images/optimized/rev-ea26883/www.stellarinfo.com/images/v7/dmca.png";
                };

                _divImg.className = "divthumb";
                _divImg.appendChild(_img);
                _divMain.appendChild(_divImg);

                const _a = document.createElement("a");
                _a.href = value.url;
                _a.textContent = value.name;
                _a.title = key;
                _a.style.color = "#fff";
                _a.className = "siteName";
                _divText.appendChild(_a);

                const _p = document.createElement("p");
                _p.textContent = "Type: ";
                _p.className = "siteLabels";

                const _span = document.createElement("span");
                _span.className = "siteValues";
                let _statusText = "Unknown";
                let _statusColor = "#eee";

                switch (_status) {
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
                }

                _span.style.color = _statusColor;
                _span.textContent = _statusText;
                _p.appendChild(_span);
                _divText.appendChild(_p);

                if (value.type) {
                    const _pType = document.createElement("p");
                    _pType.textContent = "Type: ";
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
        .catch(error => {
            console.error("An error has occurred:", error);
            status.innerHTML = "Error occurred!";
        });
});
