const fs = require("fs");
// const _ = require("loadsh");

const AnalyusisList = ["意甲", "德甲", "英超", "英冠", "西甲",
    "葡超", "荷甲", "法甲", "德乙", "法乙", "日职联", "韩K联", "俄超",
    "日职乙", "荷乙", "瑞典超", "挪超", "意杯", "葡杯", "德国杯", "法国杯"];

function statisticsFunc() {
    fs.readFile("./src/data/newDataFootball.json", "utf-8", (err, data) => {
        const res = JSON.parse(data).list;
        let computed = [];
        for (const item of res) {
            if (item.score == "*" || AnalyusisList.indexOf(item.leagueName) === -1) {
                continue
            };
            moreDeepAnalysis(item, computed);
        };
        console.log("统计完成");
        fs.writeFileSync('./src/data/deepAanlysisTwo.json', JSON.stringify(computed), "UTF-8");
    })
}




function moreDeepAnalysis(item, computed) {
    let obj = {};
    obj.actualHandicap = item["真实盘口"] + "";
    obj.whoIsSrong = item.whoIsSrong + "";
    obj.homeRank = item.homeRank;
    obj.awayRank = item.awayRank;
    obj.homeTeam = item.homeTeam;
    obj.levelSubPositioning = item.levelSubPositioning + "";
    let convertList = ["firstoddswiilian", "endoddswillian", "firstoddslibo", "endoddslibo", "firstoddsaomen", "endoddsaomen", "firstodds365", "endoddsbi365"]
    if (item.homeTeamShanglun) {
        if (Math.abs(item.levelSubPositioning) == 0) {
            obj.theoryHandicap = item["历史盘口"] + "";
        } else {
            if (item.homeTeamShanglun == item.homeTeam) {
                obj.theoryHandicap = item["历史盘口"] + "";
            } else {
                if (item["历史盘口"] < 0) {
                    if (obj.levelSubPositioning < 0) {
                        obj.theoryHandicap = (item["历史盘口"] + 0.5) + "";
                    } else {
                        obj.theoryHandicap = (Math.abs(item["历史盘口"]) + 0.5) + "";
                    };
                } else {
                    obj.theoryHandicap = (item["历史盘口"] - 0.5) + "";
                };
            };
        }
    }
    for (const iterator of convertList) {
        if (item[iterator]) {
            obj[iterator] = item[iterator];
            // for (let itemValue of obj[iterator]) {
            //     itemValue = parseFloat(itemValue);
            //     // console.log(typeof itemValue, "ccccccccc");
            // };
        }
    }
    obj.weightHome = 0;
    obj.weightAway = 0;
    for (let i = 0; i <= item.matchResultHome.length - 1; i++) {
        let iterator = item.matchResultHome[i];
        let iterator2 = item.matchResultVisit[i];
        obj.weightHome += getSixHistoryMatch(iterator, i);
        obj.weightAway += getSixHistoryMatch(iterator2, i);
    };
    obj.weightHome = obj.weightHome + "";
    obj.weightAway = obj.weightAway + "";
    // let scoreList = item.score.split(":");
    let betWayList = item.betWayList.split(",");
    if (item.whoIsSrong.indexOf("-") != -1) {
        obj["win/draw"] = Number(((betWayList[0] / betWayList[1] !== Infinity) ? betWayList[0] / betWayList[1] : 0).toFixed(3)) + "";
        obj["win/lose"] = Number(((betWayList[0] / betWayList[2] !== Infinity) ? betWayList[0] / betWayList[2] : 0).toFixed(3)) + "";
        // if (scoreList[0] > scoreList[1]) {
        //     obj.matchResult = '3';
        // } else if (scoreList[0] == scoreList[1]) {
        //     obj.matchResult = '1';
        // } else {
        //     obj.matchResult = '0';
        // };
    } else if (item.whoIsSrong.indexOf("+") != -1) {
        obj["win/draw"] = Number(((betWayList[2] / betWayList[1]) !== Infinity ? betWayList[2] / betWayList[1] : 0).toFixed(3)) + "";
        obj["win/lose"] = Number(((betWayList[2] / betWayList[0]) !== Infinity ? betWayList[2] / betWayList[0] : 0).toFixed(3)) + "";
        // if (scoreList[0] < scoreList[1]) {
        //     obj.matchResult = 0;
        // } else if (scoreList[0] == scoreList[1]) {
        //     obj.matchResult = '1';
        // } else {
        //     obj.matchResult = '3';
        // };
    };
    // let falgOFnull = false;
    // let keyofListItem = Object.keys(obj);
    // console.log(falgOFnull, "falgOFnull");
    // if (falgOFnull) {
    console.log(obj, "obj");
    // };
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
