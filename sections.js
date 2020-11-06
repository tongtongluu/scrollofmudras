let dataset, svg
let salarySizeScale, salaryXScale, categoryColorScale, originColorScale
let simulation, nodes
let categoryLegend, categoryLegend2, categoryLegend3

const categories = ['abhaya', 'abhiseka', 'anjali', 'bhumisparsha', 'dharmachakra', 'dhyana',
    'kataka', 'prajnaparamita', 'vajra', 'varada', 'vitarka', 'undefined'
]

d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

const categoriesXY = {
    'abhaya': [50, 400, 200, 200],
    'abhiseka': [50, 660, 40, 40],
    'anjali': [50, 850, 125, 125],
    'prajnaparamita': [50, 125, 40, 40],
    'dharmachakra': [350, 425, 60, 60],
    'dhyana': [350, 650, 150, 150],
    'kataka': [350, 875, 40, 40],
    'bhumisparsha': [350, 200, 125, 125],
    'varada': [625, 400, 150, 150],
    'vajra': [625, 615, 40, 40],
    'vitarka': [625, 800, 120, 120],
    'undefined': [625, 150, 70, 70]
}

const originsXY = {
    'Japan': [300, 700, 125, 125],
    'Kyoto,Japan': [400, 700, 30, 30],

    'China': [300, 300, 225, 225],
    'Henan,China': [125, 300, 30, 30],
    'Tibet,China': [475, 300, 50, 50],
    'Yunnan, China': [300, 125, 30, 30],
    'Hebei,China': [300, 475, 30, 30],
    'Fujian,China': [175, 175, 30, 30],
    'Xinjiang, China': [425, 425, 30, 30],
    'Jingdezhen,China': [175, 425, 30, 30],

    'India': [50, 550, 100, 100],
    'Karnataka state, India': [100, 550, 30, 30],
    'Tamil Nadu state, India': [50, 600, 30, 30],

    'Nepal': [50, 700, 30, 30],
    'Thailand': [525, 550, 60, 60],
    'Cambodia': [525, 650, 30, 30],
    'Pakistan': [525, 750, 30, 30],
    'Burma': [475, 850, 30, 30],
    'Korea': [300, 900, 30, 30],
    'Bangladesh': [50, 800, 40, 40],

    'unknown': [175, 850, 30, 30]
}

const origins = [
    'Bangladesh',
    'unknown',
    'Japan',
    'China',
    'Korea',
    'Burma',
    'India',
    'Nepal',
    'Thailand',
    'Cambodia',
    'Pakistan',

    'Fujian,China',
    'Xinjiang, China',
    'Karnataka state, India',
    'Kyoto,Japan',
    'Jingdezhen,China',
    'Tamil Nadu state, India',
    'Henan,China',
    'Tibet,China',
    'Yunnan, China',
    'Hebei,China',
]

const origins_values = [
    170, 205, 240, 275, 310, 345, 380, 415, 450, 485, 520, 555, 590, 625, 660, 695, 730, 765, 800, 835, 870
]

const margin = { left: 170, top: 50, bottom: 50, right: 20 }
const width = 1000 - margin.left - margin.right
const height = 950 - margin.top - margin.bottom

//Read Data, convert numerical categories into floats
//Create the initial visualisation


d3.csv('data/mudras.csv', function(d) {
    return {
        rank: d.Rank,
        image_path: d.image_path,
        name: d.name,
        mudra: d.mudra,
        origin: d.origin,
        medium: d.medium
    };
}).then(data => {
    dataset = data
    console.log(dataset)
    createScales()
    setTimeout(drawInitial(), 100)
})

const colors = ['#B55237', '#8b938c', '#BC8842', '#C1AB42', '#CF7651', '#536D58', '#E4B061', '#9EAE93', '#BED3C6', '#A6688B', '#6D4F76', '#39556D']
const origincolors = ['#FFE2B7', '#FFE2B7', '#FFE2B7', '#FFE2B7', '#FFE2B7', '#FFE2B7', '#FFE2B7', '#FFE2B7', '#FFE2B7', '#FFE2B7', '#FFE2B7', '#D4BC98', '#D4BC98', '#D4BC98', '#D4BC98', '#D4BC98', '#D4BC98', '#D4BC98', '#D4BC98', '#D4BC98', '#D4BC98', '#D4BC98']

//Create all the scales and save to global variables

function createScales() {
    salarySizeScale = d3.scaleLinear(d3.extent(dataset, d => d.Median), [5, 35])
    salaryXScale = d3.scaleLinear(d3.extent(dataset, d => d.Median), [margin.left, margin.left + width + 250])
    salaryYScale = d3.scaleLinear([20000, 110000], [margin.top + height, margin.top])
    categoryColorScale = d3.scaleOrdinal(categories, colors)
    originColorScale = d3.scaleOrdinal(origins, origincolors)
    shareWomenXScale = d3.scaleLinear(d3.extent(dataset, d => d.ShareWomen), [margin.left, margin.left + width])
    enrollmentScale = d3.scaleLinear(d3.extent(dataset, d => d.Total), [margin.left + 120, margin.left + width - 50])
    enrollmentSizeScale = d3.scaleLinear(d3.extent(dataset, d => d.Total), [10, 60])
    histXScale = d3.scaleOrdinal()
    histXScale.domain(origins)
    histXScale.range(origins_values)
    originXScale = d3.scaleOrdinal()
    histYScale = d3.scaleLinear(d3.extent(dataset, d => d.HistCol), [margin.top + height, margin.top])
}

function createLegend(x, y) {
    let svg = d3.select('#legend')

    svg.append('g')
        .attr('class', 'categoryLegend')
        .attr('transform', `translate(${x},${y})`)

    categoryLegend = d3.legendColor()
        .shape('path', d3.symbol().type(d3.symbolCircle).size(150)())
        .shapePadding(10)
        .scale(categoryColorScale)

    d3.select('.categoryLegend')
        .call(categoryLegend)

}

function createLegend2(x, y) {
    let svg = d3.select('#legend2')

    console.log("createlegend2")

    svg.append('g')
        .attr('class', 'categoryLegend2')
        .attr('transform', `translate(${x},${y})`)

    categoryLegend2 = d3.legendColor()
        .shape('path', d3.symbol().type(d3.symbolCircle).size(150)())
        .shapePadding(10)
        .scale(categoryColorScale)

    d3.select('.categoryLegend2')
        .call(categoryLegend2)
}

function createLegend3(x, y) {
    let svg = d3.select('#legend3')

    console.log("createlegend3")

    svg.append('g')
        .attr('class', 'categoryLegend3')
        .attr('transform', `translate(${x},${y})`)

    categoryLegend3 = d3.legendColor()
        .shape('path', d3.symbol().type(d3.symbolCircle).size(150)())
        .shapePadding(10)
        .scale(categoryColorScale)

    d3.select('.categoryLegend3')
        .call(categoryLegend3)
}

function createSizeLegend() {
    let svg = d3.select('#legend2')
    svg.append('g')
        .attr('class', 'sizeLegend')
        .attr('transform', `translate(100,50)`)

    sizeLegend2 = d3.legendSize()
        .scale(salarySizeScale)
        .shape('circle')
        .shapePadding(15)
        .title('Salary Scale')
        .labelFormat(d3.format("$,.2r"))
        .cells(7)

    d3.select('.sizeLegend')
        .call(sizeLegend2)
}

function createSizeLegend2() {
    let svg = d3.select('#legend3')
    svg.append('g')
        .attr('class', 'sizeLegend2')
        .attr('transform', `translate(50,100)`)

    sizeLegend2 = d3.legendSize()
        .scale(enrollmentSizeScale)
        .shape('circle')
        .shapePadding(55)
        .orient('horizontal')
        .title('Enrolment Scale')
        .labels(['1000', '200000', '400000'])
        .labelOffset(30)
        .cells(3)

    d3.select('.sizeLegend2')
        .call(sizeLegend2)
}



function mouseOver(d, i) {
    d3.select(this).moveToFront();

    d3.select(this)
        .transition('mouseover').duration(1)
        .attr('opacity', 1)
        .attr('r', 100)
        .attr('fill', function(d) {
            return "url(#" + d.rank + ")"
        })

    d3.select('#tooltip')
        .style('left', (d3.event.pageX + 100) + 'px')
        .style('top', (d3.event.pageY - 50) + 'px')
        .style('display', 'inline-block')
        .html(`<strong>Name:</strong> ${d.name} 
            <br> <strong>Mudra:</strong> ${(d.mudra)} 
            <br> <strong>Origin:</strong> ${d.origin}`)
}

function mouseOut(d, i) {
    d3.select('#tooltip')
        .style('display', 'none')

    d3.select(this)
        .transition('mouseout').duration(100)
        .attr('opacity', 0.8)
        .attr('r', 30)
}

function drawInitial() {
    //createSizeLegend()
    //createSizeLegend2()

    let svg = d3.select("#vis")
        .append('svg')
        .attr('width', 1500)
        .attr('height', 1500)
        .attr('opacity', 1)

    var defs = svg.append("defs");



    simulation = d3.forceSimulation(dataset)
    console.log(simulation);

    // Define each tick of simulation
    simulation.on('tick', () => {
        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
    })

    // Stop the simulation until later
    simulation.stop()

    // Selection of all the circles 
    defs.selectAll(".circle-pattern")
        .data(dataset)
        .enter().append("pattern")
        .attr("class", "circle-pattern")
        .attr("id", function(d) {
            return d.rank
        })
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("height", 1)
        .attr("width", 1)
        .attr("preserveAspectRatio", "none")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("xlink:href", function(d) {
            return d.image_path
        })

    defs.selectAll(".mudra-pattern")
        .data(categories)
        .enter().append("pattern")
        .attr("class", "mudra-pattern")
        .attr("id", function(d) {
            return d
        })
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("height", 1)
        .attr("width", 1)
        .attr("preserveAspectRatio", "none")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("xlink:href", function(d) {
            return "data/3_white/" + d + ".png"
        })


    svg.selectAll('.cat-rect')
        .data(categories).enter()
        .append('ellipse')
        .attr('class', 'cat-rect')
        .attr('cx', d => categoriesXY[d][0] + 120 + 1000)
        .attr('cy', d => categoriesXY[d][1] + 30)
        .attr('rx', 150)
        .attr('ry', 150)
        .attr('opacity', 0)
        .attr('fill', d => categoryColorScale(d))

    svg.selectAll('.org-rect')
        .data(origins).enter()
        .append('ellipse')
        .attr('class', 'org-rect')
        .attr('cx', d => originsXY[d][0] + 120 + 1000)
        .attr('cy', d => originsXY[d][1] + 30)
        .attr('rx', 150)
        .attr('ry', 150)
        .attr('opacity', 0)
        .attr('fill', d => originColorScale(d))

    svg.selectAll('.ico-rect')
        .data(categories).enter()
        .append('ellipse')
        .attr('class', 'ico-rect')
        .attr('cx', d => categoriesXY[d][0] + 120 + 1000)
        .attr('cy', d => categoriesXY[d][1] + 30)
        .attr('rx', 150)
        .attr('ry', 150)
        .attr('opacity', 0)
        .attr('fill', function(d) {
            console.log(d);
            return "url(#" + d + ")";
        })

    nodes = svg
        .selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('fill', function(d) {
            return "url(#" + d.rank + ")"
        })
        .attr('r', 3)
        .attr('cx', (d, i) => 5000)
        .attr('cy', (d, i) => i * 5.2 + 30)
        .attr('opacity', 0.8)
        .attr('class', d => d.mudra)
        .attr('stroke-width', 5)
        .attr('stroke', d => categoryColorScale(d.mudra))

    // Add mouseover and mouseout events for all circles
    // Changes opacity and adds border
    svg.selectAll('circle')
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)

    draw1();

    svg.selectAll('.lab-text')
        .data(categories).enter()
        .append('text')
        .attr('class', 'lab-text')
        .attr('opacity', 0)
        .raise()

    svg.selectAll('.org-text')
        .data(origins).enter()
        .append('text')
        .attr('class', 'org-text')
        .attr('opacity', 0)
        .raise()

    svg.selectAll('.lab-text')
        .text(d => `Average: $${d3.format(",.2r")(categoriesXY[d][2])}`)
        .attr('x', d => categoriesXY[d][0] + 200 + 1000)
        .attr('y', d => categoriesXY[d][1] - 500)
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', function(d, i) {
            return colors[i]
        })
        .attr('text-anchor', 'middle')
}

//Cleaning Function
//Will hide all the elements which are not necessary for a given chart type 

function clean(chartType) {
    let svg = d3.select('#vis').select('svg')
    if (chartType !== "isScatter") {
        svg.select('.scatter-x').transition().attr('opacity', 0)
        svg.select('.scatter-y').transition().attr('opacity', 0)
        svg.select('.best-fit').transition().duration(200).attr('opacity', 0)
        svg.selectAll('.lab-text').transition().attr('opacity', 0)
            .attr('x', 1800)
    }
    if (chartType !== "isMultiples") {

        svg.selectAll('.cat-rect').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.ico-rect').transition().attr('opacity', 0)
            .attr('x', 1800)
    }
    if (chartType !== "origin") {
        svg.selectAll('.org-rect').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.org-text').transition().attr('opacity', 0)
            .attr('x', 1800)
    }
    if (chartType !== "isFirst") {
        svg.select('.first-axis').transition().attr('opacity', 0)
        svg.selectAll('.small-text').transition().attr('opacity', 0)
            .attr('x', -200)
    }
    if (chartType !== "isHist") {
        svg.selectAll('.hist-axis').transition().attr('opacity', 0)
    }
    if (chartType !== "isBubble") {
        svg.select('.enrolment-axis').transition().attr('opacity', 0)
    }
}

//First draw function

function draw1() {
    let svg = d3.select("#vis").select('svg')
    let svg1 = d3.select('#mudraimg').select('svg1')
      
    clean('none')
    svg1.selectAll('circle')
        .attr('xlink:href', 'data/icon/fsg.png')
    svg.selectAll('circle')
        .transition().duration(300).delay((d, i) => i * 5)
        .attr('r', 28)
        .attr('fill', function(d) {
            return "url(#" + d.rank + ")"
        })
        .attr('opacity', 0.8)
        .attr('stroke-width', 5)
        .attr('stroke', d => categoryColorScale(d.mudra))


    svg.selectAll('circle')
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)

    simulation
        .force('charge', d3.forceManyBody().strength([2]))
        .force('forceX', d3.forceX(540))
        .force('forceY', d3.forceY(500))
        .force('collide', d3.forceCollide(32))
        .alphaDecay([0.02])

    //Reheat simulation and restart
    simulation.alpha(0.5).restart()
}

function draw2() {
    let svg = d3.select("#vis").select('svg')

    clean('none')

    svg.selectAll('circle')
        .transition().duration(100).delay((d, i) => i * 10)
        .attr('r', 15)
        .attr('opacity', 0.5)
        .attr('fill', function(d) {
            return "url(#" + d.rank + ")"
        })
        .attr('opacity', 1)
        .attr('stroke-width', 1)
        .attr('stroke', d => categoryColorScale(d.mudra))
        .attr('opacity', 1)

    svg.selectAll('circle')
        .on('mouseover', mouseOver)
        .on('mouseout', function(d, i) {
            d3.select('#tooltip')
                .style('display', 'none')

            d3.select(this)
                .transition('mouseout').duration(100)
                .attr('opacity', 1)
                .attr('r', 15)
        })


    svg.selectAll('.lab-text').transition().duration(300).delay((d, i) => i * 30)
        .text(d => d)
        .attr('x', d => categoriesXY[d][0] + 200)
        .attr('y', d => categoriesXY[d][1] + categoriesXY[d][3] / 2)
        .style("font-size", "22px")
        .style("font", "Fondamento")
        .attr('opacity', 1)

    simulation
        .force('charge', d3.forceManyBody().strength([2]))
        .force('forceX', d3.forceX(d => categoriesXY[d.mudra][0] + 200))
        .force('forceY', d3.forceY(d => categoriesXY[d.mudra][1] - 50))
        .force('collide', d3.forceCollide(15))
        .alphaDecay([0.02])

    //Reheat simulation and restart
    simulation.alpha(0.9).restart()

    createLegend(50, 50)

}

function draw3() {
    let svg = d3.select("#vis").select('svg')
    clean('isMultiples')

    svg.selectAll('circle')
        .transition().duration(400).delay((d, i) => i * 5)
        .attr('r', 12)
        .attr('stroke-width', 0)
        .attr('fill', function(d) {
            return "url(#" + d.rank + ")"
        })
        .attr('opacity', 0.2)

    svg.selectAll('circle')
        .on('mouseover', mouseOver)
        .on('mouseout', function(d, i) {
            d3.select('#tooltip')
                .style('display', 'none')

            d3.select(this)
                .transition('mouseout').duration(100)
                .attr('opacity', 0.2)
                .attr('r', 12)
        })

    svg.selectAll('.cat-rect').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)
        .attr('cx', d => categoriesXY[d][0] + 200)
        .attr('cy', d => categoriesXY[d][1] - 50)
        .attr('rx', d => categoriesXY[d][2])
        .attr('ry', d => categoriesXY[d][3])
        .attr('id', d => d)
        .attr('stroke-width', 5)
        .attr('stroke-opacity', 1)
        .attr('stroke', d => categoryColorScale(d))

    svg.selectAll('.ico-rect').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)
        .attr('cx', d => categoriesXY[d][0] + 200)
        .attr('cy', d => categoriesXY[d][1] - 50)
        .attr('rx', d => categoriesXY[d][2])
        .attr('ry', d => categoriesXY[d][3])
        .attr('id', d => d + "ico")
        .attr('stroke-width', 5)
        .attr('stroke-opacity', 1)

    simulation
        .force('charge', d3.forceManyBody().strength([2]))
        .force('forceX', d3.forceX(d => categoriesXY[d.mudra][0] + 200))
        .force('forceY', d3.forceY(d => categoriesXY[d.mudra][1] - 50))
        .force('collide', d3.forceCollide(15))
        .alpha(0.7).alphaDecay(0.02).restart()

    createLegend2(30, 50)

    d3.selectAll('.label')


    d3.select('#legend2')
        .append('image')
        .attr('x', 250)
        .attr('y', 125)
        .attr('width', 150)
        .attr('height', 150)
        .attr('id', 'mudraimg')



    var text = d3.selectAll('.label')
        .on('click', function(d) {
            let n = d3.select(this).text()
            let text
            switch (n) {
                case 'abhaya':
                    text = 'The gesture of fearlessness, which dispels fear. The right hand is held upright, and the palm is facing outwards.This is one of the earliest mudrās found depicted on a number of Buddhism artworks.It is also the most common mudra in the Smithsonian collection';
                    break;
                case 'varada':
                    text = 'This mudra signifies offering, welcome, charity, giving, compassion and sincerity. It is nearly always shown made with the left hand by a revered figure devoted to human salvation from greed, anger and delusion. The Varada mudrā is rarely seen without another mudra used by the right hand';
                    break;
                case 'anjali':
                    text = 'This mudra is widely used in the parts of Southeast Asia where Indian religions are strong. It is used as a greeting. Namaste is usually spoken with a slight bow and hands pressed together, palms touching and fingers pointing upwards, thumbs close to the chest.';
                    break;
                case 'bhumisparsha':
                    text = 'Also called "earth witness" mudra is one of the most common iconic images of Buddhism. Other names include "Buddha calling the earth to witness", and "earth-touching". It depicts the story from the Buddhist legend of the moment when Buddha achieved complete enlightenment, with Buddha sitting in meditation with his left hand, palm upright, in his lap, and his right hand touching the earth. ';
                    break;
                case 'vitarka':
                    text = 'The Vitarka mudrā "mudra of discussion" is the gesture of discussion and transmission of Buddhist teaching. It is done by joining the tips of the thumb and the index together, and keeping the other fingers straight very much like the abhaya and varada mudrās but with the thumbs touching the index fingers.';
                    break;
                case 'dhyana':
                    text = 'Also called the meditation mudra",it is the gesture of meditation. The two hands are placed on the lap, left hand on right with fingers fully stretched (four fingers resting on each other and the thumbs facing upwards towards one another diagonally), palms facing upwards; in this manner, the hands and fingers form the shape of a triangle, which is symbolic of the spiritual fire';
                    break;
                case 'dharmachakra':
                    text = 'Dharmachakra in Sanskrit means the "Wheel of Dharma". This mudra symbolizes one of the most important moments in the life of Buddha, the occasion when he preached to his companions the first sermon after his Enlightenment in the Deer Park at Sarnath. It thus denotes the setting into motion of the Wheel of the teaching of the Dharma.';
                    break;
                case 'vajra':
                    text = 'The Vajra mudrā "thunder gesture" is the gesture of knowledge. In vajra Mudra, the index finger is extended straight while rest 3 fingertips pressed against the thumb. The extended index finger denotes the fiery thunderbolt weapon or Vajra. It is a weapon with which ignorance can transform into wisdom. ';
                    break;
                case 'abhiseka':
                    text = 'Abheseka means "bathing of the divinity to whom worship is offered."It is a religious rite or method of prayer in which a devotee pours a liquid offering on an image or murti of a God or Goddess. The abhiṣeka was originally used as a consecration rite. Water from the four oceans was poured out of golden jars onto the head of royalty. ';
                    break;
                case 'prajnaparamita':
                    text = 'Prajñāpāramitā is a goddess of Wisdom. She is closely associated with the Perfection of Wisdom tradition, and indeed her name is usually translated as "Perfection of Wisdom".the mudra here is not that clear. ';
                    break;
                case 'kataka':
                    text = ' Meaning  “link in a chain” in  English,  Kataka-mukha Mudra is the twelfth hand gesture of the 28 single-hand mudras as described in the mythology.  This mudra originated from Guha when he practiced archery in front of Shiva. Appears more in dancing scenes including “plucking flowers”,“wearing a necklace of pearls or flowers”,“preparing paste for musk ”etc.';
                    break;
                case 'undefined':
                    text = 'It is not clear what mudra this is';
            }
            d3.select('#legendtext2')
                .text(text)
            d3.selectAll('circle')
                .attr('opacity', 0.2)
                .attr('r', 12)
                .on('mouseout', function(d, i) {
                    d3.select('#tooltip')
                        .style('display', 'none')

                    d3.select(this)
                        .transition('mouseout').duration(100)
                        .attr('opacity', 0.2)
                        .attr('r', 12)
                })
            d3.selectAll('.' + n)
                .attr('opacity', 1)
                .attr('r', 20)
                .on('mouseout', function(d, i) {
                    d3.select('#tooltip')
                        .style('display', 'none')

                    d3.select(this)
                        .transition('mouseout').duration(100)
                        .attr('opacity', 0.8)
                        .attr('r', 20)
                })
            d3.selectAll('.cat-rect').attr('opacity', 0.2)
            d3.selectAll('#' + n).attr('opacity', 1)
            d3.selectAll('.ico-rect').attr('opacity', 0.2)
            d3.selectAll('.ico-rect').attr('stroke-width', 5)
            d3.selectAll('#' + n + "ico").attr('opacity', 0)
            simulation
                .force('charge', d3.forceManyBody().strength([2]))
                .force('forceX', d3.forceX(d => categoriesXY[d.mudra][0] + 200))
                .force('forceY', d3.forceY(d => categoriesXY[d.mudra][1] - 50))
                .force('collide', d3.forceCollide(20))
                .alpha(0.7).alphaDecay(0.02).restart()
            d3.select('#mudraimg')
                .attr('xlink:href', 'data/2_black/' + n + '.png')
        })
        .on("mouseover", function(d) {
            d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", function(d) {
            d3.select(this).style("cursor", "default");
        })

}

function draw4() {
    let svg = d3.select("#vis").select('svg')
    clean('origin')

    svg.selectAll('circle')
        .transition().duration(400).delay((d, i) => i * 5)
        .attr('r', 7)
        .attr('stroke-width', 0)
        .attr('fill', d => categoryColorScale(d.mudra))
        .attr('opacity', 1)

    svg.selectAll('circle')
        .on('mouseover', function() {})
        .on('mouseout', function() {})


    svg.selectAll('.org-rect').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)
        .attr('cx', d => originsXY[d][0] + 200)
        .attr('cy', d => originsXY[d][1] - 50)
        .attr('rx', d => originsXY[d][2])
        .attr('ry', d => originsXY[d][3])
        .attr('id', d => d)

    svg.selectAll('.org-text').transition().duration(300).delay((d, i) => i * 30)
        .text(d => d)
        .attr('id', (d, i) => 'org' + i)
        .attr('x', d => originsXY[d][0] + 200)
        .attr('y', d => originsXY[d][1] - originsXY[d][3] / 2 - 50)
        .attr('opacity', 1)


    simulation
        .force('charge', d3.forceManyBody().strength([2]))
        .force('forceX', d3.forceX(d => originsXY[d.origin][0] + 200))
        .force('forceY', d3.forceY(d => originsXY[d.origin][1] - 50))
        .force('collide', d3.forceCollide(10))
        .alpha(0.7).alphaDecay(0.02).restart()

    createLegend(20, 50)


    var text = d3.selectAll('.label')
        .on('click', function(d) {
            var n = d3.select(this).text()
            d3.select('#legendtext2')
                .text(n)
            d3.selectAll('circle').attr('opacity', 0.2)
            d3.selectAll('.' + n).attr('opacity', 1)
            d3.selectAll('.cat-rect').attr('opacity', 0.2)
            d3.select('#' + n).attr('opacity', 1)
        })

    createLegend3(20, 50)

    var text = d3.selectAll('.label')
        .on('click', function(d) {
            let n = d3.select(this).text()
            let text
            switch (n) {
                case 'abhaya':
                    text = 'gesture of fearlessness, which dispels fear and accords divine protection and bliss in many Indian religions. The right hand is held upright, and the palm is facing outwards.[3] This is one of the earliest mudrās found depicted on a number of Hindu, Buddhist, Jain and Sikh images.也是smithsonian collection中存在最多的一种mudra';
                    break;
                case 'varada':
                    text = 'This mudra signifies offering, welcome, charity, giving, compassion and sincerity. It is nearly always shown made with the left hand by a revered figure devoted to human salvation from greed, anger and delusion. The Varada mudrā is rarely seen without another mudra used by the right hand';
                    break;
                case 'anjali':
                    text = 'This mudra  is widely used in the parts of Southeast Asia where Indian religions are strong. It is used as a greeting.Namaste is usually spoken with a slight bow and hands pressed together, palms touching and fingers pointing upwards, thumbs close to the chest.';
                    break;
                case 'bhumisparsha':
                    text = 'Also called "earth witness" mudra is one of the most common iconic images of Buddhism. Other names include "Buddha calling the earth to witness", and "earth-touching". It depicts the story from Buddhist legend of the moment when Buddha achieved complete enlightenment, with Buddha sitting in meditation with his left hand, palm upright, in his lap, and his right hand touching the earth.';
                    break;
                case 'vitarka':
                    text = 'The Vitarka mudrā "mudra of discussion" is the gesture of discussion and transmission of Buddhist teaching. It is done by joining the tips of the thumb and the index together, and keeping the other fingers straight very much like the abhaya and varada mudrās but with the thumbs touching the index fingers.';
                    break;
                case 'dhyana':
                    text = 'Also called the meditation mudra",iis the gesture of meditation, of the concentration of the Good Law and the sangha. The two hands are placed on the lap, left hand on right with fingers fully stretched (four fingers resting on each other and the thumbs facing upwards towards one another diagonally), palms facing upwards; in this manner, the hands and fingers form the shape of a triangle, which is symbolic of the spiritual fire';
                    break;
                case 'dharmachakra':
                    text = 'NOTHING IS HERE';
                    break;
                case 'vajra':
                    text = 'wtfff';
                    break;
                case 'abhiseka':
                    text = 'come on now..';
                    break;
                case 'prajnaparamita':
                    text = 'no no nothing';
                    break;
                case 'kataka':
                    text = 'katakakakakaka';
                    break;
                case 'undefined':
                    text = 'It is not clear what mudra this is';
            }
            d3.select('#legendtext3')
                .text(text)
            d3.selectAll('circle')
                .attr('opacity', function(d) {
                    if (d.mudra == n) {
                        return 1
                    } else {
                        return 0.2
                    }
                })
                .attr('stroke-width', function(d) {
                    if (d.mudra == n) {
                        return 2
                    } else {
                        return 0
                    }
                })
                .attr('stroke', function(d) {
                    if (d.mudra == n) {
                        return '#ffffff'
                    }
                })
            let o = [];
            console.log(n)
            dataset.forEach(function(d, i) {
                if (d.mudra == n) {
                    o.push(d.origin);
                }
            });
            d3.selectAll('.org-text')
                .attr('opacity', 0.2)
            o.forEach(function(d, i) {
                d3.selectAll('#org' + origins.findIndex(x => (x == d)))
                    .attr('opacity', 1)
            })
        })
        .on("mouseover", function(d) {
            d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", function(d) {
            d3.select(this).style("cursor", "default");
        })

}

//Array of all the graph functions
//Will be called from the scroller functionality

let activationFunctions = [
    draw1,
    draw2,
    draw3,
    draw4,
    draw1
]

//All the scrolling function
//Will draw a new graph based on the index provided by the scroll


let scroll = scroller()
    .container(d3.select('#graphic'))
scroll()

let lastIndex, activeIndex = 0

scroll.on('active', function(index) {
    d3.selectAll('.step')
        .transition().duration(500)
        .style('opacity', function(d, i) { return i === index ? 1 : 0.1; });

    activeIndex = index
    let sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(i => {
        activationFunctions[i]();
    })
    lastIndex = activeIndex;

})

scroll.on('progress', function(index, progress) {
    if (index == 2 & progress > 0.7) {

    }
})