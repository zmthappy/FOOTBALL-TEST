const fs = require("fs");
// const _ = require("loadsh");

const AnalyusisList = ["意甲", "德甲", "英超", "英冠", "西甲",
    "葡超", "荷甲", "法甲", "德乙", "法乙", "日职联", "俄超", "日职乙",
    "荷乙", "瑞典超", "挪超", "意杯", "葡杯", "德国杯", "法国杯", "韩K联",];
// || AnalyusisList.indexOf(item.leagueName) === -1
function statisticsFunc() {
    fs.readFile("./src/data/newDataFootball.json", "utf-8", (err, data) => {
        // fs.readFile("./src/data/saveDataofRaw.json", "utf-8", (err, data) => {
        const res = JSON.parse(data).list;
        let computed = [];
        for (const item of res) {
            if (item.score == "*") {
                continue
            };
            // calculateVariance([1, 2, 3, 4])
            moreDeepAnalysis(item, computed, "cccccccc");
        };
        console.log("统计完成");
        fs.writeFileSync('./src/data/deepAanlysisTwo.json', JSON.stringify(computed), "UTF-8");
        // fs.writeFileSync('./src/data/saveDataofRawDeep.json', JSON.stringify(computed), "UTF-8");
    })
}

// 计算4家公司的欧赔数据的方差
function calculateVariance(data) {
    // 计算平均值
    const mean = data.reduce((acc, val) => acc + val, 0) / data.length;
    // 计算每个元素与平均值的差的平方
    const squaredDifferences = data.map(val => Math.pow(val - mean, 2));
    // 计算方差
    const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / data.length;

    const pizhuncha = Math.sqrt(variance);
    return (variance / pizhuncha).toFixed(3);
}

function calculateMeanSubAoMen(data, aoMenOdds) {
    if (aoMenOdds) {
        return 0
    }
    // 计算平均值
    const mean = data.reduce((acc, val) => acc + val, 0) / data.length;
    return Math.round((mean - aoMenOdds) * 100);
}


function moreDeepAnalysis(item, computed, type) {
    let obj = {};
    obj.whoIsSrong = item.whoIsSrong;
    obj.levelSubPositioning = item.levelSubPositioning;
    obj.actualHandicap = item["真实盘口"];
    if (item.homeTeamShanglun) {
        if (Math.abs(item.levelSubPositioning) == 0) {
            if (item.homeTeam == item.homeTeamShanglun) {
                obj.theoryHandicap = item["历史盘口"];
            } else {
                if (Math.abs(item["历史盘口"]) > 0.5) {
                    if (item["历史盘口"] < 0) {
                        obj.theoryHandicap = item["历史盘口"];
                    } else {
                        obj.theoryHandicap = -(item["历史盘口"] - 0.5);
                    }
                } else {
                    obj.theoryHandicap = item["历史盘口"];
                }
            };
        } else {
            console.log(item["历史盘口"], Math.abs(item.levelSubPositioning), item.homeTeam, "cccccc");
            if (item.homeTeam == item.homeTeamShanglun) {
                obj.theoryHandicap = item["历史盘口"];
            } else {
                if (item["历史盘口"] <= 0) {
                    obj.theoryHandicap = (Math.abs(item["历史盘口"]) + 0.5);
                } else {
                    if (Math.abs(item["历史盘口"]) > 0.5) {
                        obj.theoryHandicap = -(item["历史盘口"] - 0.5);
                    } else {
                        if (Math.abs(item["历史盘口"]) == 0.5) {
                            obj.theoryHandicap = (item["历史盘口"] - 0.5);
                        } else {
                            if (Math.abs(item.levelSubPositioning) >= 0.5) {
                                obj.theoryHandicap = (item["历史盘口"] - 0.5);
                            } else {
                                obj.theoryHandicap = item["历史盘口"];
                            }
                        }
                    };
                };
            }
        };
    }
    obj.homeTeam = item.homeTeam;
    let convertList = ["firstoddswiilian", "endoddswillian", "firstoddslibo",
        "endoddslibo", "firstoddsaomen", "endoddsaomen", "firstodds365", "endoddsbi365"]
    let cosnverListFIrst = ["firstoddswiilian", "firstoddslibo", "firstoddsaomen", "firstodds365"]

    for (const iterator of convertList) {
        if (item[iterator]) {
            obj[iterator] = item[iterator];
        }
    }
    let firstOddsList = [];
    let secondeList = [];
    let threeList = [];
    let firstOtherList = [];
    let secondeOtherList = [];
    let threeOtherList = [];
    let firstAomen = [0];
    let secondeAomen = [0];
    let threeAomen = [0];
    for (const iterator of cosnverListFIrst) {
        if (item[iterator]) {
            let splitList = item[iterator].split(",");
            firstOddsList.push(Number(splitList[0]));
            secondeList.push(Number(splitList[1]));
            threeList.push(Number(splitList[2]));
            if (iterator === "firstoddsaomen") {
                firstAomen.push(Number(splitList[0]));
                secondeAomen.push(Number(splitList[1]));
                threeAomen.push(Number(splitList[2]));
            } else {
                firstOtherList.push(Number(splitList[0]));
                secondeOtherList.push(Number(splitList[1]));
                threeOtherList.push(Number(splitList[2]));
            };
        };
    };
    obj.first = calculateVariance(firstOddsList);
    obj.second = calculateVariance(secondeList);
    obj.three = calculateVariance(threeList);
    // obj.firstSubAoMen = calculateMeanSubAoMen(firstOtherList, firstAomen[0]);
    // obj.secondSubAoMen = calculateMeanSubAoMen(secondeOtherList, secondeAomen[0]);
    // obj.threeSubAoMen = calculateMeanSubAoMen(threeOtherList, threeAomen[0]);
    obj.weightHome = 0;
    obj.weightAway = 0;
    for (let i = 0; i <= item.matchResultHome.length - 1; i++) {
        let iterator = item.matchResultHome[i];
        let iterator2 = item.matchResultVisit[i];
        obj.weightHome += getSixHistoryMatch(iterator, i);
        obj.weightAway += getSixHistoryMatch(iterator2, i);
    };
    obj.weightHome = (obj.weightHome * 10);
    obj.weightAway = (obj.weightAway * 10);
    // let wiilianFirst = [];
    // let wiilianEnd = [];
    // let liboFirst = [];
    // let liboEnd = [];
    // let aomenFirst = [];
    // let aomenEndt = [];
    // let odds365First = [];
    // let odds365End = [];
    // for (const iterator2222 of convertList) {
    //     if (item[iterator2222]) {
    //         if (iterator2222.indexOf("wiilian") != -1 || iterator2222.indexOf("willian") != -1) {
    //             if (iterator2222.indexOf("firstoddswiilian") != -1) {
    //                 let item6666 = item[iterator2222].split(",");
    //                 for (const vvvvv of item6666) {
    //                     wiilianFirst.push(Number(vvvvv)); 2
    //                 };
    //             } else {
    //                 let item6666 = item[iterator2222].split(",");
    //                 for (const vvvvv of item6666) {
    //                     wiilianEnd.push(Number(vvvvv));
    //                 };
    //             };
    //         };
    //         if (iterator2222.indexOf("libo") != -1) {
    //             if (iterator2222.indexOf("first") != -1) {
    //                 let item6666 = item[iterator2222].split(",");
    //                 for (const vvvvv of item6666) {
    //                     liboFirst.push(Number(vvvvv));
    //                 };
    //             } else {
    //                 let item6666 = item[iterator2222].split(",");
    //                 for (const vvvvv of item6666) {
    //                     liboEnd.push(Number(vvvvv));
    //                 };
    //             };
    //         };
    //         if (iterator2222.indexOf("aomen") != -1) {
    //             if (iterator2222.indexOf("first") != -1) {
    //                 let item6666 = item[iterator2222].split(",");
    //                 for (const vvvvv of item6666) {
    //                     aomenFirst.push(Number(vvvvv));
    //                 };
    //             } else {
    //                 let item6666 = item[iterator2222].split(",");
    //                 for (const vvvvv of item6666) {
    //                     aomenEndt.push(Number(vvvvv));
    //                 };
    //             };
    //         };
    //         if (iterator2222.indexOf("365") != -1) {
    //             if (iterator2222.indexOf("first") != -1) {
    //                 let item6666 = item[iterator2222].split(",");
    //                 for (const vvvvv of item6666) {
    //                     odds365First.push(Number(vvvvv));
    //                 };
    //             } else {
    //                 let item6666 = item[iterator2222].split(",");
    //                 for (const vvvvv of item6666) {
    //                     odds365End.push(Number(vvvvv));
    //                 };
    //             };
    //         };
    //     };
    // };
    // for (let i = 0; i < wiilianFirst.length; i++) {
    //     obj["wiilian" + i] = Number(wiilianFirst[i] - wiilianEnd[i]).toFixed(3);
    // }
    // for (let i = 0; i < liboFirst.length; i++) {
    //     obj["libo" + i] = Number(liboFirst[i] - liboEnd[i]).toFixed(3);
    // }
    // for (let i = 0; i < aomenFirst.length; i++) {
    //     obj["aomen" + i] = Number(aomenFirst[i] - aomenEndt[i]).toFixed(3);
    // }
    // for (let i = 0; i < odds365First.length; i++) {
    //     obj["odds365" + i] = Number(odds365First[i] - odds365End[i]).toFixed(3);
    // };
    let scoreList = [];
    if (!type) {
        scoreList = item.score.split(":");
    }
    obj.homeRank = item.homeRank;
    obj.awayRank = item.awayRank;
    let betWayList = item.betWayList.split(",");
    if (item.whoIsSrong.indexOf("-") != -1) {
        obj["win/draw"] = Number(((betWayList[0] / betWayList[1] !== Infinity) ? betWayList[0] / betWayList[1] : 0).toFixed(3));
        obj["win/lose"] = Number(((betWayList[0] / betWayList[2] !== Infinity) ? betWayList[0] / betWayList[2] : 0).toFixed(3));
        if (!type) {
            if (scoreList[0] > scoreList[1]) {
                obj.matchResult = '3';
            } else if (scoreList[0] == scoreList[1]) {
                obj.matchResult = '1';
            } else {
                obj.matchResult = '0';
            };
        }
    } else if (item.whoIsSrong.indexOf("+") != -1) {
        obj["win/draw"] = Number(((betWayList[2] / betWayList[1]) !== Infinity ? betWayList[2] / betWayList[1] : 0).toFixed(3));
        obj["win/lose"] = Number(((betWayList[2] / betWayList[0]) !== Infinity ? betWayList[2] / betWayList[0] : 0).toFixed(3));
        if (!type) {
            if (scoreList[0] < scoreList[1]) {
                obj.matchResult = 0;
            } else if (scoreList[0] == scoreList[1]) {
                obj.matchResult = '1';
            } else {
                obj.matchResult = '3';
            };
        }
    } else {
        obj["win/draw"] = 0;
        obj["win/lose"] = 0;
        if (!type) {
            if (scoreList[0] < scoreList[1]) {
                obj.matchResult = 0;
            } else if (scoreList[0] == scoreList[1]) {
                obj.matchResult = '1';
            } else {
                obj.matchResult = '3';
            };
        }
    }

    let falgOFnull = false;
    let keyofListItem = Object.keys(obj);
    for (const iterator8888 of keyofListItem) {
        if (iterator8888 == "null" || iterator8888 == "undefined" || iterator8888 == "0" || !iterator8888) {
            falgOFnull = true;
        }
    }
    console.log(falgOFnull, "falgOFnull");
    if (falgOFnull) {
        console.log(obj, "obj");
        return
    };
    computed.push(obj);
}

function getSixHistoryMatch(resultOfMatch, index) {
    let weightTotal = 0;
    switch (resultOfMatch) {
        case "胜":
            weightTotal += setWeight(index) * 3;
            break;
        case "平":
            weightTotal += setWeight(index) * 1;
            break;
        case "负":
            weightTotal += setWeight(index) * 0;
            break;
    };
    return weightTotal;
}

function setWeight(index) {
    let weight = 0;
    switch (index) {
        case 0:
            weight = 3
            break;
        case 1:
            weight = 2
            break
        case 2:
            weight = 2
            break
        case 3:
            weight = 1.5;
            break;
        case 4:
            weight = 1.25;
            break;
        case 5:
            weight = 0.25;
            break;
    }
    return weight;
}


statisticsFunc();
