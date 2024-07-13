$(document).ready(function() {
    const status = $("#status");
    const siteList = $("#siteList");
    let allSites = [];

    status.text("Initializing...");

    $.getJSON("https://raw.githack.com/OshekharO/Web-Indexer/main/providers.json")
        .done(function(data) {
            allSites = Object.entries(data).map(([key, value]) => ({ key, ...value }));
            renderSites(allSites);
            status.text("Indexing complete").fadeOut(3000);
        })
        .fail(function() {
            console.log("An error has occurred.");
            status.text("Error occurred. Please try again later.");
        });

    function renderSites(sites) {
        siteList.empty();
        sites.forEach((site, index) => {
            if (site.url === "NONE") return;

            const card = $('<div class="site-card"></div>');
            const thumbnail = site.icon || `https://picsum.photos/seed/${site.name}/200/150`;
            
            card.html(`
                <img src="${thumbnail}" alt="${site.name}" loading="lazy" onerror="this.src='https://picsum.photos/200/150'">
                <h3><a href="${site.url}" target="_blank">${site.name}</a></h3>
                <p><i class="fas fa-tag"></i> Type: <span class="site-type">${getStatusText(site.status)}</span></p>
                ${site.type ? `<p><i class="fas fa-folder"></i> Category: ${site.type}</p>` : ''}
            `);

            siteList.append(card);

            // Animate card appearance
            gsap.to(card, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                delay: index * 0.1
            });
        });
    }

    function getStatusText(status) {
        const statusMap = {
            0: "NSFW",
            1: "MANGA",
            2: "NOVEL",
            3: "MOVIE",
            4: "APP",
            5: "ANIME"
        };
        return statusMap[status] || "Unknown";
    }

    $(".filter-btn").click(function() {
        $(".filter-btn").removeClass("active");
        $(this).addClass("active");
        const filter = $(this).data("filter");
        
        const filteredSites = filter === "all" 
            ? allSites 
            : allSites.filter(site => getStatusText(site.status).toLowerCase() === filter);
        
        renderSites(filteredSites);
    });

    $("#searchInput").on("input", function() {
        const searchTerm = $(this).val().toLowerCase();
        const filteredSites = allSites.filter(site => 
            site.name.toLowerCase().includes(searchTerm) || 
            (site.type && site.type.toLowerCase().includes(searchTerm))
        );
        renderSites(filteredSites);
    });

    // Add parallax effect to background
    $(window).on('mousemove', function(e) {
        const moveX = (e.pageX * -1 / 15);
        const moveY = (e.pageY * -1 / 15);
        $('.background-animation').css({
            'background-position': moveX + 'px ' + moveY + 'px'
        });
    });
});
