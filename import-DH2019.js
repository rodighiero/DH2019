const fs = require('fs')
const theses = require('./sources/DH2019/DH2019.json')

json = []

// "id": "oai:dspace.mit.edu:1721.1/32463",
// "title": "A microfabricated ElectroQuasiStatic induction turbine-generator",
// "abstract": "An ElectroQuasiStatic (EQS) induction machine has been fabricated and has generated net electric power. A maximum power output of 192 [mu]W at 235 krpm has been measured under driven excitation of the six phases. Self excited operation was also demonstrated. Under self-excitation, no external drive electronics are required and sufficient power was produced to dimly light four LED's on two of the six phases. This is believed to be the first demonstration of both power generation and self-excited operation of an EQS induction machine of any scale reported in the open literature. The generator comprises 5 silicon layers, fusion bonded together, and annealed at 700⁰C. The turbine rotor, 4 mm in diameter, is supported on gas bearings. The thrust bearings are formed by a shallow etch of 1.5 [mu]m to define the thrust bearing gap. Thrust bearing pressurization is through 10 [mu]m diameter nozzles, etched 100 [mu]m deep. The journal bearing is a precision, ... wide, 300 [mu]m deep annular trench around the periphery of the turbine disk. The generator airgap is 3 [mu]m. The inner radius of the generator is 1.011 mm, and the outer radius 1.87mm. The machine has ].31 poles for each of the 6 phases, for a total of 786 stator electrodes. Precise microfabrication and aligned, full-wafer fusion bonding enabled turbine generator devices to be operated at rotational speeds as high as 850 krpm. A detailed state-space model of the EQS machine and its external parasitics is presented. The external stray capacitances, and their unbalance, play a critical role in the performance of the device. A method for estimating the strays experimentally is discussed.",
// "advisors": ["Carol Livermore"],
// "text": "A m

theses.forEach(thesis => {
    obj = {}
    obj.id = thesis.paperID
    obj.title = thesis.title
    obj.text = thesis.abstract.replace(/[_\*\.\n]/g, ' ')
    obj.advisors = thesis.authors.split(/;\n/)
        .filter(d => d.length > 0)
        .map(d => d.replace(/\([\d,]+\)/, ''))
        .map(d => d.split(', ').reverse().join(' '));
    json.push(obj)
})

console.log(json)

fs.writeFileSync('./data/docs-DH2019.json', JSON.stringify(json, null, 2) )