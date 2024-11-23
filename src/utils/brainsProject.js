// const brans = require("brain.js")
const fs = require("fs");
// 新数据分组
const data = require("../data/saveDataofRawDeep.json")
// const data = require("../data/saveDataofRawDeepTranform.json")
const data2 = require("../data/deepAanlysisTwo.json");
const rawData = require("../data/newDataFootball.json");
let trainsDta = [];
let predictData = [];
let predictDataTeamName = [];
let result = [];
const tree = require("../../machineLearningAlgorithms/DecisionTree")
var ml = require('machine_learning');

let preditctResutl = [];

function main(type) {
    if (type) {
        for (const iterator of data) {
            let objSelft = {
                features: [],
                label: "",
            };
            // let = [];
            objSelft.label = (iterator.matchResult);
            delete iterator.homeTeam
            delete iterator.matchResult
            let keyList = Object.keys(iterator);
            for (const item of keyList) {
                objSelft.features.push(iterator[item]);
            }
            trainsDta.push(objSelft);
        };
        for (const iterator of data2) {
            let objSelft = {
                features: [],
            };
            predictDataTeamName.push(iterator.homeTeam);
            delete iterator.homeTeam
            let keyList = Object.keys(iterator);
            for (const item of keyList) {
                objSelft.features.push(iterator[item]);
            }
            predictData.push(objSelft);
        };
        const decisionTree = new tree.DecisionTree();
        // console.log(trainsDta, "predictData");
        decisionTree.train(trainsDta);
        const predictions = decisionTree.predict(predictData);
        let resultArray = [];
        for (let i = 0; i < predictions.length; i++) {
            let obj = {
                homeTame: predictDataTeamName[i],
                result: predictions[i],
            };
            resultArray.push(obj);
        }
        console.log(resultArray);
    } else {
        for (const iterator of data) {
            let obj = [];
            result.push(iterator.matchResult);
            delete iterator.matchResult
            let keyList = Object.keys(iterator);
            for (const item of keyList) {
                obj.push(iterator[item]);
            }
            trainsDta.push(obj);
        };
        for (const iterator of data2) {
            let obj1 = [];
            obj1.push(iterator.homeTeam);
            delete iterator.homeTeam
            // delete iterator.matchResult
            let keyList = Object.keys(iterator);
            for (const item of keyList) {
                obj1.push(iterator[item]);
            }
            predictData.push(obj1);
        };
        var dt = new ml.DecisionTree({
            data: trainsDta,
            result: result
        });
        dt.build();
        for (const iterator of predictData) {
            let obj = {};
            // for (const value of rawData.list) {
            // console.log(value.homeTeam, iterator[0], "iterator[0]");
            // if (value.homeTeam == iterator[0]) {
            obj.homeTeam = iterator[0];
            //     break;
            // };
            // };
            let filterSList = iterator.filter((item, index) => {
                if (index != 0) {
                    return item
                };
            })
            // console.log(filterSList, "iterator");
            obj.result = dt.classify(filterSList);
            console.log("Classify : ", obj.result);
            preditctResutl.push(obj);
            // dt.prune(1.0); // 1.0 : mingain.
            // dt.print();
        };
        fs.writeFileSync('./src/data/predictResult.json', JSON.stringify(preditctResutl), "UTF-8");
    }
}

main("")

