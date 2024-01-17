/*
    main.js
    Data Visualization data story
    Used to collect all visualizations in one js file
*/

/*
    Constants for names
*/
const groupNames = {
    genre: "genre",
    length: "length",
    price: "price",
    difficulty: "difficulty",
    action: "Action",
    adventure: "Adventure",
    puzzle: "Puzzle",
    strategy: "Strategy",
    shooter: "Shooter"

}

// My visualizations 
const visualizationNamesArray = [
    "Introduction",
    "Bar Chart",
    "Parallel Coordinates Groups",
    "Parallel Coordinates Games",
    "End"
]
/*
    End of constants for names
*/


const MARGINS = { TOP: 100, BOTTOM: 100, LEFT: 100, RIGHT: 100 }

const HEIGHT = 600 - MARGINS.TOP - MARGINS.BOTTOM
const WIDTH = 800 - MARGINS.LEFT - MARGINS.RIGHT

// a variable for what games are currently grouped by
let currentGrouping = groupNames.genre;
let currentVisualization = visualizationNamesArray[0];


/*
    Setting up the canvas space
*/

const svg = d3.select("#chart-area").append("svg")
    .attr("width", WIDTH + MARGINS.LEFT + MARGINS.RIGHT)
    .attr("height", HEIGHT + MARGINS.TOP + MARGINS.BOTTOM)

const mainGroup = svg.append("g")


// Scale for colors
const colour = d3.scaleOrdinal()
    .range(d3.schemeCategory10)

// formatter for percentages
const formatter = d3.format(".1f");


// Load in data from GameData.csv

let csvData = {};

d3.csv('GameData.csv', null, function (data) {
    return {
        name: data["name"],
        genre: data["genre"],
        length: +data["length"],
        price: data["price"],
        difficulty: data["difficulty"],
        startRate: +data["start rate"],
        middleRate: +data["middle rate"],
        completionRate: +data["complete rate"],
    }
}).then(function (data) {
    // set globally accessible data
    csvData = data;
    // update the visualization
    update(csvData, currentVisualization);
});

function updateBarChart(data) {

    const processedData = getBarChartData(data, currentGrouping)

    colour.domain(processedData.map(item => item.group))

    const barChartGroup = mainGroup.append("g")
        .attr("transform", `translate(${MARGINS.LEFT}, ${MARGINS.TOP})`)

    // Scale for the x-axis, used for bar chart
    const x = d3.scaleBand()
        .domain(processedData.map(d => d.group))
        .range([0, WIDTH])
        .paddingInner(0.2)
        .paddingOuter(0.1)

    // Scale for the y-axis, used for bar chart.
    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([HEIGHT, 0])

    // Clean all previous axis data
    barChartGroup.selectAll(".x-axis").remove()
    barChartGroup.selectAll(".y-axis").remove()

    // create an x axis group
    const xAxis = barChartGroup.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${HEIGHT})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("font-size", "15px")

    // create a y axis group
    const yAxis = barChartGroup.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).ticks(10).tickFormat(d => d + "%"))

    yAxis.selectAll("text").attr("font-size", "15px")


    // Label for the x-axis, which are the groupings
    barChartGroup.append("text")
        .attr("class", "x-axis")
        .attr("x", WIDTH / 2)
        .attr("y", HEIGHT + 60)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text(currentGrouping)

    // Label for the y axis, which are the completion rates
    barChartGroup.append("text")
        .attr("class", "y-axis")
        .attr("x", - (HEIGHT / 2))
        .attr("y", -60)
        .attr("font-size", "25px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Completion Rate")


    // JOIN
    const bars = barChartGroup.selectAll("rect")
        .data(processedData)

    // EXIT
    bars.exit().remove()

    // UPDATE
    bars.attr("y", d => y(d.averageCompletionRate))
        .attr("x", (d) => x(d.group))
        .attr("width", x.bandwidth)
        .attr("height", d => HEIGHT - y(d.averageCompletionRate))

    // ENTER
    bars.enter().append("rect")
        .attr("y", d => y(d.averageCompletionRate))
        .attr("x", (d) => x(d.group))
        .attr("width", x.bandwidth)
        .attr("height", d => HEIGHT - y(d.averageCompletionRate))
        .attr("fill", d => colour(d.group))
}

function drawLinePCGroups(d, xScale, yScale) {
    return d3.line()([[xScale(0), yScale(d.averageStartRate)], [xScale(1), yScale(d.averageMiddleRate)], [xScale(2), yScale(d.averageCompletionRate)]])
}

function updatePCGroups(data) {

    const processedData = getPCGroupsData(data, currentGrouping);

    colour.domain(processedData.map(item => item.group))

    loadTableDataPCGroup(processedData);

    const pcGroup = mainGroup.append("g")
        .attr("transform", `translate(${MARGINS.LEFT}, ${MARGINS.TOP})`)

    const xScales = [0, 1, 2];

    const x = d3.scalePoint()
        .domain(xScales)
        .range([MARGINS.LEFT, WIDTH])

    // Scale for the y-axis, used for bar chart.
    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([HEIGHT, 0])



    // Labels for each axis
    pcGroup.append("text")
        .attr("class", "y-axis")
        .attr("x", x(0))
        .attr("y", - MARGINS.TOP / 5)
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .text("Start(%)")

    pcGroup.append("text")
        .attr("class", "y-axis")
        .attr("x", x(1))
        .attr("y", - MARGINS.TOP / 5)
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .text("Middle(%)")

    pcGroup.append("text")
        .attr("class", "x-axis")
        .attr("x", x(2))
        .attr("y", - MARGINS.TOP / 5)
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .text("End(%)")


    // JOIN
    const lines = pcGroup.selectAll("customPaths")
        .data(processedData)

    // ENTER
    lines.enter().append("path")
    .attr("class", "line")
        .attr("d", (d) => drawLinePCGroups(d, x, y))
        .style("fill", "none")
        .style("stroke", d => colour(d.group))
        .style("stroke-width", "4px")
        .on("mouseover", function (event, d) {
            const pathName = d.group;
            d3.selectAll(".line").style("display", function (d) {
                if (d.group == pathName) {
                    return "inline"
                } else {
                    return "none"
                }
            });
        })
        .on("mouseout", function(event, d) {
            d3.selectAll(".line").style("display", "inline");
        })

    const startRateGroup = pcGroup.append("g")
        .attr("transform", `translate(${x(0)}, ${0})`)
    const midRateGroup = pcGroup.append("g")
        .attr("transform", `translate(${x(1)}, ${0})`)
    const endRateGroup = pcGroup.append("g")
        .attr("transform", `translate(${x(2)}, ${0})`)

    const startAxis = startRateGroup.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).ticks(10).tickFormat(d => d + "%"))
    const midAxis = midRateGroup.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).ticks(10).tickFormat(d => d + "%"))
    const endAxis = endRateGroup.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).ticks(10).tickFormat(d => d + "%"))

    // set the text to be more readable
    startAxis.selectAll("text").attr("font-size", "15px")
    midAxis.selectAll("text").attr("font-size", "15px")
    endAxis.selectAll("text").attr("font-size", "15px")
}

function drawLinePCGames(d, xScale, yLength, yPrice, yDifficulty, yRates) {
    const pricePosition = yPrice(d.price) + yPrice.bandwidth(d.price) / 2;
    const difficultyPosition = yDifficulty(d.difficulty) + yDifficulty.bandwidth(d.difficulty) / 2;
    return d3.line()([[xScale(0), yLength(d.length)], [xScale(1), pricePosition], [xScale(2), difficultyPosition], [xScale(3), yRates(d.startRate)], [xScale(4), yRates(d.middleRate)], [xScale(5), yRates(d.completionRate)]])
}

function roundUpTo5(length) {
    return length - (length % 5) + 5
}

function updatePCGames(data) {

    const processedData = getPCGamesData(data, currentGrouping);

    colour.domain(processedData.map(item => item.name))

    loadTableDataPCGames(processedData);

    const pcGames = mainGroup.append("g")
        .attr("transform", `translate(${MARGINS.LEFT}, ${MARGINS.TOP})`)


    const xScales = [0, 1, 2, 3, 4, 5];

    const x = d3.scalePoint()
        .domain(xScales)
        .range([MARGINS.LEFT, WIDTH])


    const highestGameLength = d3.max(processedData.map(game => game.length));
    // Scale for the y-axis for the length of a game
    const yLength = d3.scaleLinear()
        .domain([0, highestGameLength])
        .range([HEIGHT, 0])
        .nice()

    // Scale for the y-axis for the price of a game
    const yPrice = d3.scaleBand()
        .domain(["Free", "Below 20", "Above 20"])
        .range([HEIGHT, 0])
        .paddingInner(0.1)
        .paddingOuter(0.2)

    // Scale for the y-axis for the difficulty of a game
    const yDifficulty = d3.scaleBand()
        .domain(["Casual", "Difficult"])
        .range([HEIGHT, 0])
        .paddingInner(0.1)
        .paddingOuter(0.2)


    // Scale for the y-axis for start, mid and end rates, used for the second parallel coordinates chart.
    const yRates = d3.scaleLinear()
        .domain([0, 100])
        .range([HEIGHT, 0])



    pcGames.append("text")
        .attr("class", "y-axis")
        .attr("x", x(0))
        .attr("y", - MARGINS.TOP / 5)
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .text("Length(hrs)")

    pcGames.append("text")
        .attr("class", "y-axis")
        .attr("x", x(1))
        .attr("y", - MARGINS.TOP / 5)
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .text("Price(£)")

    pcGames.append("text")
        .attr("class", "x-axis")
        .attr("x", x(2))
        .attr("y", - MARGINS.TOP / 5)
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .text("Difficulty")


    pcGames.append("text")
        .attr("class", "y-axis")
        .attr("x", x(3))
        .attr("y", - MARGINS.TOP / 5)
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .text("Start(%)")

    pcGames.append("text")
        .attr("class", "y-axis")
        .attr("x", x(4))
        .attr("y", - MARGINS.TOP / 5)
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .text("Middle(%)")

    pcGames.append("text")
        .attr("class", "x-axis")
        .attr("x", x(5))
        .attr("y", - MARGINS.TOP / 5)
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .text("End(%)")

    // JOIN
    const lines = pcGames.selectAll("customPaths")
        .data(processedData)

    // ENTER
    lines.enter().append("path")
        .attr("class", "line")
        .attr("d", (d) => drawLinePCGames(d, x, yLength, yPrice, yDifficulty, yRates))
        .style("fill", "none")
        .style("stroke", d => colour(d.name))
        .style("stroke-width", "4px")
        .on("mouseover", function (event, d) {
            const pathName = d.name;
            d3.selectAll(".line").style("display", function (d) {
                if (d.name == pathName) {
                    return "inline"
                } else {
                    return "none"
                }
            });
        })
        .on("mouseout", function(event, d) {
            d3.selectAll(".line").style("display", "inline");
        })

    // Set up axis for length
    const lengthGroup = pcGames.append("g")
        .attr("transform", `translate(${x(0)}, ${0})`)

    const lengthAxis = lengthGroup.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yLength).ticks(10).tickFormat(d => d + "hrs"))

    // Set up axis for price
    const priceGroup = pcGames.append("g")
        .attr("transform", `translate(${x(1)}, ${0})`)

    const priceAxis = priceGroup.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yPrice).ticks(3))

    // Set up axis for price
    const difficultyGroup = pcGames.append("g")
        .attr("transform", `translate(${x(2)}, ${0})`)

    const difficultyAxis = difficultyGroup.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yDifficulty).ticks(2))


    // Set up axis for the rates
    const startRateGroup = pcGames.append("g")
        .attr("transform", `translate(${x(3)}, ${0})`)
    const midRateGroup = pcGames.append("g")
        .attr("transform", `translate(${x(4)}, ${0})`)
    const endRateGroup = pcGames.append("g")
        .attr("transform", `translate(${x(5)}, ${0})`)

    const startAxis = startRateGroup.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yRates).ticks(10).tickFormat(d => d + "%"))
    const midAxis = midRateGroup.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yRates).ticks(10).tickFormat(d => d + "%"))
    const endAxis = endRateGroup.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yRates).ticks(10).tickFormat(d => d + "%"))

    // Labels for axis

    // Set the text for the axis to be more readable
    lengthAxis.selectAll("text").attr("font-size", "15px")
    priceAxis.selectAll("text").attr("font-size", "15px")
    difficultyAxis.selectAll("text").attr("font-size", "15px")
    startAxis.selectAll("text").attr("font-size", "15px")
    midAxis.selectAll("text").attr("font-size", "15px")
    endAxis.selectAll("text").attr("font-size", "15px")
}

function updateIntroduction() {
    
}

// Function to choose appropriate visualization based on given name.
function update(data, visualizationName) {

    mainGroup.select("g").remove()
    writeDescription();

    switch (visualizationName) {
        case visualizationNamesArray[1]:
            updateBarChart(data);
            break;
        case visualizationNamesArray[2]:
            updatePCGroups(data);
            break;
        case visualizationNamesArray[3]:
            updatePCGames(data);
            break;
        default:
            break;
    }
}

/*
    Function to sort different lengths into 3 groups

    Short - games that take less than or around 5 hours to complete, usually in one sitting
    Adventure - longer games that take from 5 to 20 hours to complete, possibly with side content
    Campaign - very long games with loads of side content to complete 
*/
function lengthHelper(timeToComplete) {
    if (timeToComplete <= 5) {
        return "Short(<5hrs)";
    } else if (timeToComplete > 5 && timeToComplete < 20) {
        return "Adventure(5-20hrs)";
    } else {
        return "Campaign(>20hrs)";
    }
}

/*
    A helper function to process the data into groups for the Bar Chart 
*/
function getBarChartData(inputData, groupName) {
    const groupTemplate = { group: "", completionRate: 10, numberOfGames: 0 };

    const nameTotalAndNumber = [...inputData.reduce((acc, object) => {
        let key;
        if (groupName == "length") {
            key = lengthHelper(object[groupName]);
        } else {
            key = object[groupName];
        }

        const item = acc.get(key) || Object.assign({}, groupTemplate, {
            group: key,
            completionRate: 0,
            numberOfGames: 0
        });

        item.completionRate += object.completionRate;
        item.numberOfGames += 1;

        return acc.set(key, item);
    }, new Map).values()];



    const result = nameTotalAndNumber.map(item => {
        return { group: item.group, averageCompletionRate: (item.completionRate / item.numberOfGames) }
    });


    return result;
}
/*
    A helper function to process the data into groups for the 1st Parallel Coordinates chart
 */

function getPCGroupsData(inputData, groupName) {
    const groupTemplate = { group: "", startRate: 10, middleRate: 10, completionRate: 10, numberOfGames: 0 };

    const nameTotalAndNumber = [...inputData.reduce((acc, object) => {
        let key;
        if (groupName == "length") {
            key = lengthHelper(object[groupName]);
        } else {
            key = object[groupName];
        }

        const item = acc.get(key) || Object.assign({}, groupTemplate, {
            group: key,
            startRate: 0,
            middleRate: 0,
            completionRate: 0,
            numberOfGames: 0
        });

        item.startRate += object.startRate;
        item.middleRate += object.middleRate;
        item.completionRate += object.completionRate;

        item.numberOfGames += 1;

        return acc.set(key, item);
    }, new Map).values()];



    const result = nameTotalAndNumber.map(item => {
        return { group: item.group, averageStartRate: (item.startRate / item.numberOfGames), averageMiddleRate: (item.middleRate / item.numberOfGames), averageCompletionRate: (item.completionRate / item.numberOfGames) }
    });


    return result;
}

/*
    A helper function to process the data into games of a particular genre for the 2nd Parallel Coordinates chart
 */

function getPCGamesData(inputData, groupName) {
    const result = inputData.filter(item => item.genre == groupName);

    return result;
}

// Used to hide next button when there is no next visualization and hide prev button when there is no previous visualization
function hideNavigationButtons(index) {

    const minIndex = 0;
    const maxIndex = 4;

    const prevButton = document.getElementById("btnPrev");
    const nextButton = document.getElementById("btnNext");

    if(index == minIndex) {
        prevButton.setAttribute("hidden", "hidden");
        nextButton.removeAttribute("hidden");
    } else if (index == maxIndex) {
        prevButton.removeAttribute("hidden");
        nextButton.setAttribute("hidden", "hidden");
    } else {
        prevButton.removeAttribute("hidden"); 
        nextButton.removeAttribute("hidden");    
    }
}

let pageIndex = 0

$("#btnPrev").click(() => {
    pageIndex = pageIndex == 0 ? 0 : pageIndex - 1
    hideNavigationButtons(pageIndex);
    setOptionsList()
    currentVisualization = visualizationNamesArray[pageIndex];
    if (currentVisualization == visualizationNamesArray[3]) {
        currentGrouping = groupNames.action
    } else {
        currentGrouping = groupNames.genre
    }
    setActiveTable(currentVisualization);
    manageText(pageIndex);
    update(csvData, currentVisualization)
});

$("#btnNext").click(() => {
    pageIndex = pageIndex == 4 ? 4 : pageIndex + 1
    hideNavigationButtons(pageIndex);
    setOptionsList()
    currentVisualization = visualizationNamesArray[pageIndex]
    if (currentVisualization == visualizationNamesArray[3]) {
        currentGrouping = groupNames.action
    } else {
        currentGrouping = groupNames.genre
    }
    setActiveTable(currentVisualization);
    manageText(pageIndex);
    update(csvData, currentVisualization)
});

// Set options for every filter drop down menu for every visualization 
function setOptionsList() {

    const filterText = document.getElementById("filter-text")
    const filter = document.getElementById("filter-select")

    if (pageIndex == 0) {
        $("#subTitleLabel").text("Introduction");
        
        filterText.setAttribute("hidden", "hidden");
        filter.setAttribute("hidden", "hidden");
    }

    if (pageIndex == 1) {

        $("#subTitleLabel").text("Completion Rates");

        filterText.removeAttribute("hidden");
        filter.removeAttribute("hidden");

        $('#filter-select').empty()
        $('#filter-select').append($('<option>', {
            value: groupNames.genre,
            text: 'Genre'
        }));
        $('#filter-select').append($('<option>', {
            value: groupNames.length,
            text: 'Length'
        }));
        $('#filter-select').append($('<option>', {
            value: groupNames.price,
            text: 'Price'
        }));
        $('#filter-select').append($('<option>', {
            value: groupNames.difficulty,
            text: 'Difficulty'
        }));
    }

    if (pageIndex == 2) {
        $("#subTitleLabel").text("Overall Progression");

        filterText.removeAttribute("hidden");
        filter.removeAttribute("hidden");
        $('#filter-select').empty()
        $('#filter-select').append($('<option>', {
            value: groupNames.genre,
            text: 'Genre'
        }));
        $('#filter-select').append($('<option>', {
            value: groupNames.length,
            text: 'Length'
        }));
        $('#filter-select').append($('<option>', {
            value: groupNames.price,
            text: 'Price'
        }));
        $('#filter-select').append($('<option>', {
            value: groupNames.difficulty,
            text: 'Difficulty'
        }));
    }

    if (pageIndex == 3) {
        $("#subTitleLabel").text("Progression within genres");

        filterText.removeAttribute("hidden");
        filter.removeAttribute("hidden");


        $('#filter-select').empty()
        $('#filter-select').append($('<option>', {
            value: groupNames.action,
            text: groupNames.action
        }));
        $('#filter-select').append($('<option>', {
            value: groupNames.adventure,
            text: groupNames.adventure
        }));
        $('#filter-select').append($('<option>', {
            value: groupNames.puzzle,
            text: groupNames.puzzle
        }));
        $('#filter-select').append($('<option>', {
            value: groupNames.strategy,
            text: groupNames.strategy
        }));
        $('#filter-select').append($('<option>', {
            value: groupNames.shooter,
            text: groupNames.shooter
        }));
    }

    if (pageIndex == 4) {
        $("#subTitleLabel").text("The End!");

        filterText.setAttribute("hidden", "hidden");
        filter.setAttribute("hidden", "hidden");
    }
}

$("#filter-select").on('change', function () {
    currentGrouping = this.value;
    update(csvData, currentVisualization);
})

window.onload = () => {
    hideNavigationButtons(0);
    setOptionsList()
    setActiveTable(currentVisualization)
    manageText(0);
}

function setActiveTable(visualizationName) {
    const pcGroupSelections = document.getElementById("pcGroupSelections");
    const pcGameSelections = document.getElementById("pcGameSelections");
    if (visualizationName == visualizationNamesArray[2]) {
        pcGroupSelections.removeAttribute("hidden");
        pcGameSelections.setAttribute("hidden", "hidden");
    } else if (visualizationName == visualizationNamesArray[3]) {
        pcGroupSelections.setAttribute("hidden", "hidden");
        pcGameSelections.removeAttribute("hidden");
    } else {
        pcGroupSelections.setAttribute("hidden", "hidden");
        pcGameSelections.setAttribute("hidden", "hidden");
    }
}

function loadTableDataPCGroup(items) {

    const table = document.getElementById("dataTableBody");
    table.innerHTML = ""

    items.forEach(item => {
        let row = table.insertRow();
        row.style = `background-color:${colour(item.group)}`
        let group = row.insertCell(0);
        group.innerHTML = item.group;
        group.style = `color:${"#faf7f5"}`
        let startRate = row.insertCell(1);
        startRate.innerHTML = formatter(item.averageStartRate) + "%";
        startRate.style = `color:${"#faf7f5"}`
        let middleRate = row.insertCell(2);
        middleRate.innerHTML = formatter(item.averageMiddleRate) + "%";
        middleRate.style = `color:${"#faf7f5"}`
        let completionRate = row.insertCell(3);
        completionRate.innerHTML = formatter(item.averageCompletionRate) + "%";
        completionRate.style = `color:${"#faf7f5"}`
    });
}

function loadTableDataPCGames(items) {

    const table = document.getElementById("dataTable2Body");
    table.innerHTML = ""

    items.forEach(item => {
        let row = table.insertRow();
        row.style = `background-color:${colour(item.name)}`
        let name = row.insertCell(0);
        name.innerHTML = item.name;
        name.style = `color:${"#faf7f5"}`
        let length = row.insertCell(1);
        length.innerHTML = item.length + " hrs";
        length.style = `color:${"#faf7f5"}`
        let price = row.insertCell(2);
        price.innerHTML = item.price;
        price.style = `color:${"#faf7f5"}`
        let difficulty = row.insertCell(3);
        difficulty.innerHTML = item.difficulty;
        difficulty.style = `color:${"#faf7f5"}`
        let startRate = row.insertCell(4);
        startRate.innerHTML = item.startRate + "%";
        startRate.style = `color:${"#faf7f5"}`
        let middleRate = row.insertCell(5);
        middleRate.innerHTML = item.middleRate + "%";
        middleRate.style = `color:${"#faf7f5"}`
        let completionRate = row.insertCell(6);
        completionRate.innerHTML = item.completionRate + "%";
        completionRate.style = `color:${"#faf7f5"}`
    });
}

const descriptions = {
    barChartGenre: "No genre has the completion rate a game developer likely wishes for when they first start, but nothing can be perfect! Puzzle games take the lead, while adventure games have the lowest completion rate.",
    barChartLength: "Game length perhaps is unsurprising. Shorter games, especially those more likely to be completed in one sitting, seem to be completed more often. ",
    barChartPrice: "Price might be a bit surprising, it was for me, as games below 20£ are completed more often. Perhaps richer players have too high standards…",
    barChartDifficulty: "Few players shy away from a challenge, as difficult games have a slightly higher completion rate!",
    pcGroupsGenre: "Most players (80-85%) seem to give the games a reasonable chance, gaining a Steam achievement that would suggest they at least started the game. Puzzle and Strategy keep above 50%, while others have about half their players till the middle point. All games seem to retain a higher percentage of players from middle to end than from start to middle. ",
    pcGroupsLength: "Interestingly, games between 5-15 hours have the highest start rate. I suppose there’s always tomorrow to complete it when it comes to short games! Campaigns may be a bit intimidating to start… or feature a character creator the player never got out of…",
    pcGroupsPrice: "Differently priced games seem to have a similar starting rate, though more costly ones seem to lose players more quickly. Free games seem to have trouble getting started, which can be explained, as there’s no consequence to simply having the game sit in your Steam library… except making it feel lonely ):",
    pcGroupsDifficulty: "To go along with the slightly higher completion rate, difficult games also have a somewhat higher overall progression. The right to boast about beating a difficult game is a powerful motivator!",
    pcGamesAction: "Action games vary greatly in length, though the shorter ones get completed by a higher percentage of their players. Overall they tend to be expensive and considered less difficult, though the difficult ones do not stand out as completed less often.",
    pcGamesAdventure: "Adventure games tend to be quite long and quite expensive. To offset the length and price of the game, it seems that game developers try to make them easier to progress in terms of difficulty." ,
    pcGamesPuzzle: "Puzzle games tend to be shorter and cheaper. They also are considered more casual games. Most importantly, some show the highest completion numbers amongst all games, reaching over 70%.",
    pcGamesStrategy: "While Strategy games can have a long playtime, that doesn’t necessarily equate to a high price. They are also quite split in terms of difficulty. In this case, however, shorter playtime does not necessarily mean higher completion rates.",
    pcGamesShooter: "Shooter games that feature a story seem quite expensive and, while not as impressive as Adventure games, are also quite long. There seems not to be an obvious connection between length, difficulty and progression rates.",
}

function getDescription() {
    switch (currentVisualization) {
        case visualizationNamesArray[1]:
            switch (currentGrouping) {
                case groupNames.genre:
                    return descriptions.barChartGenre;
                case groupNames.length:
                    return descriptions.barChartLength;
                case groupNames.price:
                    return descriptions.barChartPrice;
                case groupNames.difficulty:
                    return descriptions.barChartDifficulty;
            }
            break;
        case visualizationNamesArray[2]:
            switch (currentGrouping) {
                case groupNames.genre:
                    return descriptions.pcGroupsGenre;
                case groupNames.length:
                    return descriptions.pcGroupsLength;
                case groupNames.price:
                    return descriptions.pcGroupsPrice;
                case groupNames.difficulty:
                    return descriptions.pcGroupsDifficulty;
            }
            break;
        case visualizationNamesArray[3]:
            switch (currentGrouping) {
                case groupNames.action:
                    return descriptions.pcGamesAction;
                case groupNames.adventure:
                    return descriptions.pcGamesAdventure;
                case groupNames.puzzle:
                    return descriptions.pcGamesPuzzle;
                case groupNames.strategy:
                    return descriptions.pcGamesStrategy;
                case groupNames.shooter:
                    return descriptions.pcGamesShooter;
            }
            break;
        default:
            return "";

    }
}

function writeDescription() {
    const description = document.getElementById("description");
    description.innerHTML = getDescription();
}

function manageText(index) {
    const introduction = document.getElementById("introduction")
    const end = document.getElementById("end")

    if (index == 0){
        introduction.removeAttribute("hidden")
        end.setAttribute("hidden", "hidden")
    } else if (index == 4) {
        introduction.setAttribute("hidden", "hidden")
        end.removeAttribute("hidden")
    } else {
        introduction.setAttribute("hidden", "hidden")
        end.setAttribute("hidden", "hidden")
    }
}


