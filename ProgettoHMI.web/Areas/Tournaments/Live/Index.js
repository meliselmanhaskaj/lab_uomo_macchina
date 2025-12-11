var Tournaments;
(function (Tournaments) {
    var Live;
    (function (Live) {
        class indexViewModel {
            constructor(model, drawUrl) {
                this.selectedCities = [];
                this.selectedRanks = [];
                this.startDate = null;
                this.endDate = null;
                this.filtersCount = 0;
                this.popUpTournament = null;
                this.cardWidth = "";
                this.showTournamentLst = [];
                this.showTournamentFlag = true;
                this.initCities = () => {
                    this.cities = [
                        { value: "Milano", selected: false },
                        { value: "Roma", selected: false },
                        { value: "Torino", selected: false },
                        { value: "Napoli", selected: false },
                        { value: "Firenze", selected: false },
                        { value: "Bologna", selected: false },
                        { value: "Palermo", selected: false },
                        { value: "Genova", selected: false },
                        { value: "Catania", selected: false },
                        { value: "Verona", selected: false }
                    ];
                };
                this.initRanks = () => {
                    this.ranks = [
                        { value: "1", label: "Bronzo", selected: false },
                        { value: "2", label: "Argento", selected: false },
                        { value: "3", label: "Oro", selected: false },
                        { value: "4", label: "Diamante", selected: false }
                    ];
                };
                this.initShowTournament = () => {
                    this.showTournamentLst = [];
                    this.showTournamentFlag = true;
                    this.showMoreTournaments();
                };
                this.resetFilters = () => {
                    this.selectedCities = [];
                    this.initCities();
                    this.selectedRanks = [];
                    this.initRanks();
                    this.startDate = null;
                    this.endDate = null;
                    this.filtersCount = 0;
                    try { this.updateUrlWithFilters(); } catch (e) { }
                };
                /* -------- Tournaments -------- */
                this.getTournaments = async (filters) => {
                    let res = await fetch(this.model.urlFilters, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(filters)
                    });
                    if (res.ok) {
                        let data = await res.json();
                        this.model.tournaments = data;
                        this.initShowTournament();
                    }
                    else {
                        console.error("Failed to fetch tournaments:", res.statusText);
                    }
                };
                this.performTournamentReq = () => {
                    // update URL immediately so bookmarks reflect current filters
                    try { this.updateUrlWithFilters(); } catch (e) { }
                    let data = {
                        city: this.selectedCities,
                        rank: this.selectedRanks,
                        startDate: this.startDate,
                        endDate: this.endDate,
                        status: 1
                    };
                    this.getTournaments(data);
                };
                this.handleCitySelectionChange = (city) => {
                    if (city.selected) {
                        this.selectedCities.push(city.value);
                    }
                    else {
                        const index = this.selectedCities.indexOf(city.value);
                        if (index > -1) {
                            this.selectedCities.splice(index, 1);
                        }
                    }
                    this.performTournamentReq();
                };
                this.handleCityOnClick = (city) => {
                    city.selected = !city.selected;
                    if (city.selected) {
                        this.filtersCount++;
                    }
                    else {
                        this.filtersCount--;
                    }
                    this.handleCitySelectionChange(city);
                };
                this.handleRankSelectionChange = (rank) => {
                    if (rank.selected) {
                        this.selectedRanks.push(Number(rank.value));
                    }
                    else {
                        const index = this.selectedRanks.indexOf(Number(rank.value));
                        if (index > -1) {
                            this.selectedRanks.splice(index, 1);
                        }
                    }
                    this.performTournamentReq();
                };
                this.handleRankOnClick = (rank) => {
                    rank.selected = !rank.selected;
                    if (rank.selected) {
                        this.filtersCount++;
                    }
                    else {
                        this.filtersCount--;
                    }
                    this.handleRankSelectionChange(rank);
                };
                this.handleStartDateChange = () => {
                    if (typeof this.startDate === "string" && this.startDate === "") {
                        this.startDate = null;
                        this.endDate = null;
                        this.filtersCount--;
                    }
                    else {
                        this.endDate = new Date(this.startDate);
                        this.endDate.setDate(this.endDate.getDate() + 90);
                        this.filtersCount++;
                    }
                    this.performTournamentReq();
                };
                this.showMoreTournaments = () => {
                    let lenStart = this.showTournamentLst.length;
                    for (let i = lenStart; i < 10 + lenStart && this.showTournamentFlag; ++i) {
                        let len = this.showTournamentLst.length;
                        if (len < this.model.tournaments.length) {
                            this.showTournamentLst.push(this.model.tournaments[i]);
                        }
                        else {
                            this.showTournamentFlag = false;
                        }
                    }
                    if (this.showTournamentLst.length == this.model.tournaments.length) {
                        this.showTournamentFlag = false;
                    }
                };
                /* -------- Games -------- */
                this.getGames = async (tournamentId) => {
                    let res = await fetch(`${this.model.urlGames}?tournamentId=${tournamentId}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        },
                    });
                    if (res.ok) {
                        let data = await res.json();
                        this.model.games = data;
                    }
                    else {
                        this.model.games = [];
                        console.error("Failed to fetch tournaments:", res.statusText);
                    }
                };
                this.performeGamesReq = (tournamentId) => {
                    if (this.popUpTournament != tournamentId)
                        this.popUpTournament = tournamentId;
                    else
                        this.popUpTournament = null;
                    this.getGames(tournamentId);
                };

                // Update URL with current filters and save to localStorage
                this.updateUrlWithFilters = () => {
                    try {
                        const params = new URLSearchParams();
                        if (this.selectedCities && this.selectedCities.length > 0) {
                            params.set('cities', this.selectedCities.join(','));
                        }
                        if (this.selectedRanks && this.selectedRanks.length > 0) {
                            params.set('ranks', this.selectedRanks.join(','));
                        }
                        if (this.startDate) {
                            let dateStr = (this.startDate instanceof Date) ? this.startDate.toISOString().split('T')[0] : this.startDate;
                            params.set('startDate', dateStr);
                        }
                        const qs = params.toString();
                        const newUrl = window.location.pathname + (qs ? '?' + qs : '');
                        // pushState so bookmark will include it
                        window.history.pushState(null, '', newUrl);
                        try { localStorage.setItem('tournaments_live_filters', qs); } catch (e) { }
                        ;
                    }
                    catch (e) {
                        ;
                    }
                };

                // Load filters from URL or fallback to localStorage
                this.loadFiltersFromUrl = () => {
                    try {
                        const paramsFromLocation = new URLSearchParams(window.location.search);
                        let params = paramsFromLocation;
                        if (!paramsFromLocation.toString()) {
                            try {
                                const saved = localStorage.getItem('tournaments_live_filters');
                                if (saved) {
                                    params = new URLSearchParams(saved);
                                    const newUrl = window.location.pathname + (saved ? '?' + saved : '');
                                    window.history.replaceState(null, '', newUrl);
                                }
                            }
                            catch (e) { }
                        }

                        ;

                        const citiesParam = params.get('cities');
                        if (citiesParam) {
                            const citiesArray = citiesParam.split(',');
                            citiesArray.forEach(city => {
                                const cityObj = this.cities.find(c => c.value === city);
                                if (cityObj) {
                                    cityObj.selected = true;
                                    this.selectedCities.push(city);
                                    this.filtersCount++;
                                }
                            });
                        }
                        const ranksParam = params.get('ranks');
                        if (ranksParam) {
                            const ranksArray = ranksParam.split(',').map(r => Number(r));
                            ranksArray.forEach(rank => {
                                const rankObj = this.ranks.find(r => Number(r.value) === rank);
                                if (rankObj) {
                                    rankObj.selected = true;
                                    this.selectedRanks.push(rank);
                                    this.filtersCount++;
                                }
                            });
                        }
                        const dateParam = params.get('startDate');
                        if (dateParam) {
                            this.startDate = dateParam;
                            this.endDate = new Date(dateParam);
                            this.endDate.setDate(this.endDate.getDate() + 90);
                            this.filtersCount++;
                        }

                        ;

                        if (this.filtersCount > 0) {
                            const data = { city: this.selectedCities, rank: this.selectedRanks, startDate: this.startDate, endDate: this.endDate, status: 1 };
                            this.getTournaments(data);
                        }
                    }
                    catch (e) {
                        ;
                    }
                };
                this.model = model;
                this.model.games = [];
                this.initCities();
                this.initRanks();
                // try to restore filters from URL or localStorage; if none, initialize show list
                try { this.loadFiltersFromUrl(); } catch (e) { }
                if (this.filtersCount === 0) {
                    this.initShowTournament();
                }
                this.drawUrl = drawUrl;
            }
        }
        Live.indexViewModel = indexViewModel;
    })(Live = Tournaments.Live || (Tournaments.Live = {}));
})(Tournaments || (Tournaments = {}));
//# sourceMappingURL=Index.js.map