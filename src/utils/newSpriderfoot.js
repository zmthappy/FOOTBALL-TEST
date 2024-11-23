//从天天盈球爬取当前的足彩数据进行分析
// const request = require("./main.js");
const dayjs = require("dayjs");
const eventproxy = require('eventproxy');
const fs = require('fs');
const async = require("async")
const ep = eventproxy();
const cheerio = require('cheerio');

const superagent = require("superagent");
const axois = require("axios");
const iconv = require('iconv-lite');

// const pool = require('../mysqlConnetct/mysqlConnect.js')

// 时间选择期返回时间
function getDateTime(day) {
    return dayjs().subtract(dayNumber, "day").format("YYYY-MM-DD");
};

const instance = axois.create({
    timeout: 1000,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        'Accept': "application/json, text/plain, */*",
        "Content-Type": "text/html;charset=UTF-8",
        "Cookie": 'VUID=VUID1660971514734693048; Hm_lvt_2f681cc061628030f35b9c0e56b9b06c=1686139220; NAGENTID=2335205; JSESSIONID=591827C421454A34F95908777819D37C.c219; jcobroute=39c10c70202ef73cb885a1d700f518f5; firstStart=true; Hm_lvt_f081063fc7e101407949a8005a9b3e56=1687364012,1687397231,1687493950,1687519963; Hm_lpvt_f081063fc7e101407949a8005a9b3e56=1687520042'
    }
});

//axios配置 
function getData(url, data, chearSet) {
    return new Promise((resolve, reject) => {
        axois({
            method: "get",
            url: url,
            data: data,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                "Accept-Language": "zh-CN,zh;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Connection": "keep-alive",
                "Cookie": 'VUID=VUID1660971514734693048; Hm_lvt_2f681cc061628030f35b9c0e56b9b06c=1686139220; NAGENTID=2335205; JSESSIONID=591827C421454A34F95908777819D37C.c219; jcobroute=39c10c70202ef73cb885a1d700f518f5; firstStart=true; Hm_lvt_f081063fc7e101407949a8005a9b3e56=1687364012,1687397231,1687493950,1687519963; Hm_lpvt_f081063fc7e101407949a8005a9b3e56=1687520042'
            }
        }).then(function (response, err) {
            resolve(response.data)
        }).catch((err) => {
            console.log(err, "err");
            resolve(err?.response?.status);
        })
    })
}

function postData(url, data, chearSet) {
    return new Promise((resolve, reject) => {
        axois({
            method: "post",
            url: url,
            data: data,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                "Accept-Language": "zh-CN,zh;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Connection": "keep-alive",
                "Cookie": 'VUID=VUID1660971514734693048; Hm_lvt_2f681cc061628030f35b9c0e56b9b06c=1686139220; NAGENTID=2335205; JSESSIONID=591827C421454A34F95908777819D37C.c219; jcobroute=39c10c70202ef73cb885a1d700f518f5; firstStart=true; Hm_lvt_f081063fc7e101407949a8005a9b3e56=1687364012,1687397231,1687493950,1687519963; Hm_lpvt_f081063fc7e101407949a8005a9b3e56=1687520042'
            }
        }).then(function (response) {
            resolve(response.data)
        }).catch((err) => {
            resolve(err?.response?.status);
        })
    })
}

// 设置当前请求的时间
const toDay = new Date();
// 升班马：
const newPromoter = [];

const leagueList = ["日职联", "韩K联", "俄超", "意甲", "德甲", "英超", "英冠", "西甲",
    "葡超", "荷甲", "法甲", "瑞典超", "美职业", "德乙", "荷乙", "英足总杯", "法乙",
    "巴甲", "挪超", "日职乙", "欧国联", "天皇杯", "意杯", "葡杯", "挪威杯", "英联杯", "亚精英赛", "世亚预", "德国杯", "世南美预", "法国杯", "欧冠杯", "国际友谊", "日联杯", "欧联杯", "解放者杯", "欧洲杯", "美洲杯", "美职联", "欧协联"]

const leagueListCompunted = ["意甲", "德甲", "英超", "英冠", "西甲",
    "葡超", "荷甲", "法甲", "德乙", "法乙",];

// 需要爬取的国家, "美国"
const leagueCountry = ["西班牙", "德国", "法国", "葡萄牙", "荷兰", "英格兰", "意大利", "日本", "韩国"]

// 降板马
const subLeagueTeam = ["卢顿", "伯恩利", "谢菲联", "科隆", "洛里昂",
    "克莱蒙"];
// 国家队比赛
const countryMatch = ["国际友谊", "欧洲杯", "亚洲杯", "非洲杯", "世界杯", "美职业"]


// 设置获取的范围
let rangeTime = [];
// 存储数据的方法
const computeList = {
    'list': [],
};
// 获取当前的并发的数量
let OccurCount = 0;
getTimeRangeData();
// 爬取固定时间段端内的所有数据
// function getTimeRangeData(start = dayjs().format("YYYY-MM-DD"), end = dayjs().format("YYYY-MM-DD")) {
// function getTimeRangeData(start = "2024-01-01", end = "2024-03-17") {
// function getTimeRangeData(start = "2024-10-18", end = "2024-10-20") {
function getTimeRangeData(start = dayjs().add(0, "day").format("YYYY-MM-DD"), end = dayjs().add(1, "day").format("YYYY-MM-DD")) {
    let startTime = dayjs(start).format("YYYY-MM-DD");
    rangeTime.push(startTime);
    const endTime = dayjs(end).format("YYYY-MM-DD");
    while (true) {
        if (startTime == endTime) {
            break
        };
        startTime = dayjs(startTime).add(1, 'day').format("YYYY-MM-DD");
        // if ((dayjs(startTime).day()) == 0 || (dayjs(startTime).day()) == 6) {
        rangeTime.push(startTime)
        // };
    };
}


function spirderMain() {
    async.mapLimit(rangeTime, 1, function (rangeTimes, callBack) {
        console.log("开始爬取：" + rangeTimes);
        ttyqFootBallData(rangeTimes, callBack);
    }, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("结束爬取");
        }
    })
}

spirderMain();

// 当天的数据
async function ttyqFootBallData(toDayTime, callBack, selfData) {
    console.log("start:" + toDayTime);
    let data = await getData(`https://www.ttyingqiu.com/static/no_cache/league/zc/jsbf/ttyq2020/jczq/jsbf_${toDayTime}.json?v=${toDay.getTime()}`, {});
    // let data = await getData(`https://www.ttyingqiu.com/static/no_cache/league/zc/jsbf/ttyq2020/bd/jsbf_${toDayTime}.json?v=${toDay.getTime()}`, {});
    let jcData = await getData(`https://www.ttyingqiu.com/static/no_cache/league/zc/jsbf/ttyq2020/jczq/${toDayTime}/oz_407_6.json?v=${toDay.getTime()}`, {})
    if (data == 404 || !data) {
        callBack(null, 404);
        return
    };
    const hebingList = [];
    const dataJSon = data.matchList;
    const jcDataJson = jcData;
    dataJSon.forEach(item => {
        jcDataJson.forEach(js => {
            if (item.matchId == js.matchId) {
                delete js.matchId;
                let i = "";
                i = { ...item, ...js };
                hebingList.push(i);
            }
        })
    });
    async.mapLimit(hebingList, 1, function (hebingLists, callBack) {
        console.log("开始解析：" + hebingLists.homeName);
        if (leagueList.indexOf(hebingLists.leagueName) != -1) {
            // if (hebingLists.homeName == "勒沃库森") {
            invokeAllFunc(hebingLists, callBack, toDayTime)
        } else {
            callBack(null, "test")
        };
    }, function (err, result) {
        callBack(null, result)
    })
}


//调用所有数据
async function invokeAllFunc(item, callBack, toDayTime) {
    let obj = {};
    obj['homeTeam'] = item.homeName;
    obj['visitedTeam'] = item.awayName;
    obj['leagueName'] = item.leagueName;
    // obj['matchNoCn'] = item.matchNoCn;
    // obj['matchDate'] = item.matchDate;
    // obj['matchId'] = item.matchId;
    obj['whoIsSrong'] = item.handicap_1;
    obj['score'] = item.score[1];
    obj['toDayTime'] = toDayTime;
    obj['homeRank'] = item.homeRank;
    obj['awayRank'] = item.awayRank;
    try {
        // getTeamRank(item, obj);
        await getHomeAndAwayResult(item, obj, callBack);
        await delaySecibd();
        await getBetWayValueOfMatchId(item, obj, callBack);
        await delaySecibd();
        if (countryMatch.indexOf(item.leagueName) === -1) {
            await getThreeSeasonRank(item, obj, callBack);
            await delaySecibd();
        };
        await getAllEurOdds(item, obj, callBack);
        await delaySecibd();
        await getSixResult(item, obj, callBack);
        await delaySecibd();
        await getSixResultVisited(item, obj, callBack);
        await delaySecibd();
        await getRecentTenMatch(item, obj, callBack);
        await delaySecibd();
        await getAsia(item, obj, callBack);
        await delaySecibd();
        callBack(null, obj);
    } catch {
        callBack(null, 404);
    }
}

function delaySecibd() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({});
        }, 200);
    })

}


function recall(callBack, item, obj) {
    if (typeof callBack === 'function') {
        callBack(item, obj);
    };
}


// 获取betWay的数组
async function getBetWayValueOfMatchId(item, obj, callBack) {
    let path = `/api/matchcenter/queryBFMatch?matchId=${item.qtMatchId}&agentId=2335059&platform=wap&appVersion=7.7.3&from=jcob`;
    let url = `https://m.ttyingqiu.com/api/matchcenter/queryBFMatch?matchId=${item.qtMatchId}&agentId=2335059&platform=wap&appVersion=7.7.3&from=jcob`;
    axois.get(url, {
        headers: {
            "Cache-Control": "max-age=0",
            "Sec-Ch-Ua": '"Not/A)Brand";v="99", "Microsoft Edge";v="115", "Chromium";v="115"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "Accept-Encoding": "gzip, deflate, br",
            'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Content-Type": "text/html;charset=UTF-8",
            "Cookie": 'VUID=VUID1684064218919764079; Hm_lvt_f081063fc7e101407949a8005a9b3e56=1688727630,1688829029,1688829061,1688870712; device_uuid=dgb6oImE9qptyGy7jwfaeDN3jN5nt-yqlWtWpTno5j7lw'
        },
    }).then(function (response, err) {
        let res1 = response.data;
        obj["betWayList"] = [res1.bfMatch.homeAmount, res1.bfMatch.drawAmount, res1.bfMatch.awayAmount].join();
    }).catch((err) => {
        console.log(err, "err");
    })
}

// 获取两队的近期的的对应的主客场的排名
async function getHomeAndAwayResult(item, obj, callBack) {
    const params = {
        apiName: "getMatchPointRankAicai",
        leagueMatchId: item.matchId,
    };
    let res1 = await postData('https://sport.ttyingqiu.com/sportdata/f?platform=web', params);
    // res1 = JSON.parse(res1)
    let homeChangCi = res1.leagueMatchTeamRankVO.homeTeamWin + res1.leagueMatchTeamRankVO.homeTeamDraw + res1.leagueMatchTeamRankVO.homeTeamLost;
    let awayChangCi = res1.leagueMatchTeamRankVO.awayTeamWin + res1.leagueMatchTeamRankVO.awayTeamDraw + res1.leagueMatchTeamRankVO.awayTeamLost;
    obj["nowMatchChangCi"] = (homeChangCi >= awayChangCi) ? homeChangCi : awayChangCi;
    obj['inHomeRank'] = res1.homeAwayRankVO.homeTeamRank;
    obj["inAwayRank"] = res1.homeAwayRankVO.awayTeamRank;
}

// 获取两队近市场的结果
async function getRecentTenMatch(item, obj, callBack) {
    const params = {
        Number: 6,
        apiName: "TeamBoutExploitsQueryAiCaiApi",
        matchId: item.matchId,
        isHomeAway: 0,
        handicapProviderId: 5,
        europeProviderId: 111,
        bigSmallProviderId: 5,
    }
    let res1 = await postData('https://sport.ttyingqiu.com/sportdata/f?platform=web', params);
    obj["homeAndAwayMatchResult"] = [];
    if (!res1) {
        recall(getRecentTenMatch, item, obj);
        return
    };
    if (res1.list) {
        let nowDay = dayjs().format("YYYY-MM-DD");
        for (let i = 0; i <= res1.list.length - 1; i++) {
            if (obj["homeAndAwayMatchResult"].length < 1) {
                // console.log(dayjs(nowDay).diff(dayjs("20" + res1.list[i].matchTime), "months"), "20" + res1.list[i].matchTime, "cccccccccccc");
                if (dayjs(nowDay).diff(dayjs("20" + res1.list[i].matchTime), "months") <= 18) {
                    obj["365ChuShangLun"] = res1.list[i].firstAsiaHandicap;
                    obj["365ZOngShangLun"] = res1.list[i].asiaHanciap;
                    obj["365QiuShangLun"] = res1.list[i].firstBigSmallHanciap;
                    obj["365MatchTimeShangLun"] = res1.list[i].matchTime;
                    obj["homeTeamShanglun"] = res1.list[i].homeName;
                    obj["amidithion"] = res1.list[i].amidithion;
                    obj["homeAndAwayMatchResult"] = [{
                        chu: res1.list[i].firstAsiaHandicap,
                    }];
                };
            };
        };
        if (obj.homeAndAwayMatchResult.length == 0) {
            obj["365ChuShangLun"] = "";
            obj["365ZOngShangLun"] = "";
            obj["365QiuShangLun"] = "";
            obj["365MatchTimeShangLun"] = "";
        };
    };
}

async function getTeamId(res, teamName, teamScore) {
    let res1 = await postData("https://sport.ttyingqiu.com/sportdata/f?platform=web", {
        apiName: "getEsGetLeagueList",
        keyWord: res
    });
    let leagueId = 0;
    for (const iterator of res1.leagues) {
        if (iterator.leagueName == res) {
            leagueId = iterator.leagueId;
        };
    };
    let params2 = {
        apiName: "queryLeagueSeasons",
        leagueId: leagueId,
    };
    console.log(params2, "params2");
    let res2 = await postData("https://sport.ttyingqiu.com/sportdata/f?platform=web", params2);
    if (!res2) {
        recall(getTeamId, item, obj);
        return
    };
    let params3 = {
        apiName: "queryLeagueFootballTeamScore",
        conference: 0,
        leagueId: leagueId,
        leagueSeasonId: res2.leagueInfoSimpleVo.leagueSeasons[1].id,
        leagueSessionType: 0,
        seasonFlag: res2.leagueInfoSimpleVo.leagueSeasons[1].seasonFlag,
    };
    let res3 = await postData("https://sport.ttyingqiu.com/sportdata/f?platform=web", params3);
    let homeAveRank = teamScore;
    let secondRank = res3.footballTeamScoreVoList.length;
    for (const iterator of res3.footballTeamScoreVoList) {
        if (iterator.nameCn == teamName) {
            console.log(iterator.rank, teamScore, "teamName");
            secondRank = iterator.rank;
            break;
        };
    };
    homeAveRank = Math.round((secondRank + teamScore) / 2);
    return homeAveRank;
}



// 获取当前比赛两队二个赛季汇总平均排名
async function getThreeSeasonRank(item, obj, callBack) {
    // console.log(obj, "obj");
    const params = {
        apiName: "getMatchInfoById",
        qtMatchId: item.qtMatchId,
    };
    let res = await postData("https://sport.ttyingqiu.com/sportdata/f?platform=web", params);
    if (!res) {
        recall(getThreeSeasonRank, item, obj);
        return
    };
    let homeAveRank = Number(item.homeRank);
    let awayAveRank = Number(item.awayRank);
    let leagueName = res.leagueMatchVO.leagueName;
    if (!obj.nowMatchChangCi || obj.nowMatchChangCi == 0) {
        homeAveRank = 0;
        awayAveRank = 0;
    };
    // console.log(homeAveRank, awayAveRank, leagueName.indexOf("杯") === -1, "sssssssssssssssssssssssssss");
    obj['homeTeamLeageaName'] = leagueName;
    obj['visitedTeamLeageaName'] = leagueName;
    if (leagueName.indexOf("杯") === -1) {
        let params2 = {
            apiName: "queryLeagueSeasons",
            leagueId: res.leagueMatchVO.leagueId,
        };
        let res2 = await postData("https://sport.ttyingqiu.com/sportdata/f?platform=web", params2);
        // res2 = JSON.parse(res2);
        // 获取当前比赛之前的球队的排名
        // let nowRound = 1;
        // let res4 = await postData("https://sport.ttyingqiu.com/sportdata/f?platform=web", {
        //     apiName: "queryLeagueStatistics",
        //     leagueId: res.leagueMatchVO.leagueId,
        //     rateType: 0,
        //     seasonFlag: res2.leagueInfoSimpleVo.leagueSeasons[0].seasonFlag,
        //     seasonId: res2.leagueInfoSimpleVo.leagueSeasons[0].id,
        //     seasonName: res2.leagueInfoSimpleVo.leagueSeasons[0].name,
        // });
        // for (let i = Number(res4.oddsStatisticsVo.round); i >= 1; i--) {
        //     let res5 = await postData("https://sport.ttyingqiu.com/sportdata/f?platform=web", {
        //         apiName: "getLeagueMatchList",
        //         leagueId: res.leagueMatchVO.leagueId,
        //         pageNo: 1,
        //         pageSize: 100,
        //         seasonFlag: res2.leagueInfoSimpleVo.leagueSeasons[0].seasonFlag,
        //         seasonName: res2.leagueInfoSimpleVo.leagueSeasons[0].name,
        //         round: i.toString(),
        //     });
        //     if (dayjs(res5.matchList[0].matchDate).diff(dayjs(obj["matchDate"]), "day") == 0) {
        //         nowRound = i.toString();
        //         break;
        //     };
        // };
        let params3 = {
            apiName: "queryLeagueFootballTeamScore",
            conference: 0,
            leagueId: res.leagueMatchVO.leagueId,
            leagueSeasonId: res2.leagueInfoSimpleVo.leagueSeasons[1].id,
            leagueSessionType: 0,
            seasonFlag: res2.leagueInfoSimpleVo.leagueSeasons[1].seasonFlag,
        };
        let res3 = await postData("https://sport.ttyingqiu.com/sportdata/f?platform=web", params3);
        let secondRankHome = res3.footballTeamScoreVoList.length;
        let secondRankVisit = res3.footballTeamScoreVoList.length;
        if (subLeagueTeam.indexOf(obj.homeTeam) != -1) {
            secondRankHome = 1;
        };
        if (subLeagueTeam.indexOf(obj.visitedTeam) != -1) {
            secondRankVisit = 1;
        };
        for (const iterator of res3.footballTeamScoreVoList) {
            if (iterator.nameCn == obj.homeTeam) {
                if (!obj.nowMatchChangCi || obj.nowMatchChangCi == 0) {
                    homeAveRank = iterator.rank;
                    secondRankHome = 0;
                } else {
                    secondRankHome = iterator.rank;
                    homeAveRank = Math.round((secondRankHome + homeAveRank) / 2);
                };
            };
            if (iterator.nameCn == obj.visitedTeam) {
                if (!obj.nowMatchChangCi || obj.nowMatchChangCi == 0) {
                    awayAveRank = iterator.rank;
                    secondRankVisit = 0;
                } else {
                    secondRankVisit = iterator.rank;
                    awayAveRank = Math.round((secondRankVisit + awayAveRank) / 2);
                };
            };
        };
        if (secondRankHome == res3.footballTeamScoreVoList.length || secondRankHome == 1) {
            homeAveRank = Math.round((secondRankHome + homeAveRank) / 2);
        };
        if (secondRankVisit == res3.footballTeamScoreVoList.length || secondRankVisit == 1) {
            awayAveRank = Math.round((secondRankVisit + awayAveRank) / 2);
        };
        // 获取最近两个赛季的排名
        // for (let i = 0; i <= 1; i++) {ccc
        //     let res3 = await postData("https://sport.ttyingqiu.com/sportdata/f?platform=web", params3);
        //     res3 = JSON.parse(res3);
        //     for (const iterator of res3.footballTeamScoreVoList) {
        //         if (iterator.nameCn == obj.homeTeam) {
        //             if (i == 0) {
        //                 homeAveRank = iterator.rank;
        //             } else {
        //                 homeAveRank = Math.round((iterator.rank + homeAveRank) / 2);
        //             };
        //         } else if (iterator.nameCn == obj.visitedTeam) {
        //             if (i == 0) {
        //                 awayAveRank = iterator.rank;
        //             } else {
        //                 awayAveRank = Math.round((iterator.rank + awayAveRank) / 2);
        //             };
        //         };
        //     };
        // };
        obj["ThreeSeasonAverageHome"] = homeAveRank;
        obj["ThreeSeasonAverageAway"] = awayAveRank;
    } else {
        const regex = /[\u4e00-\u9fa5]/g;
        let regReturnHome = res.leagueMatchVO.awayRank.match(regex).join('');
        let regReturnvisi = res.leagueMatchVO.homeRank.match(regex).join('');
        obj['homeTeamLeageaName'] = regReturnHome;
        obj['visitedTeamLeageaName'] = regReturnvisi;
        if (subLeagueTeam.indexOf(obj.homeTeam) != -1) {
            obj["ThreeSeasonAverageHome"] = Math.round((1 + homeAveRank) / 2);
        } else {
            obj["ThreeSeasonAverageHome"] = await getTeamId(regReturnHome, obj.homeTeam, homeAveRank);
        };
        if (subLeagueTeam.indexOf(obj.visitedTeam) != -1) {
            obj["ThreeSeasonAverageAway"] = Math.round((1 + awayAveRank) / 2);
        } else {
            obj["ThreeSeasonAverageAway"] = await getTeamId(regReturnvisi, obj.visitedTeam, awayAveRank);
        };
        console.log(obj["ThreeSeasonAverageHome"], obj["ThreeSeasonAverageAway"], "awayAveRank");
    };
}


// 获取所有欧洲赔率公司的数据
async function getAllEurOdds(item, obj, callBack) {
    const params = {
        apiName: "getFtAicaiAllEuropeOdds",
        isPrimary: 0,
        matchId: item.matchId,
        pageNo: 1,
        pageSize: 1000
    };
    let res1 = await getData(`https://www.ttyingqiu.com/live/matchDetail/ftAicaiAllEuropeOdds?matchId=${item.matchId}&isPrimary=0`, {});
    if (!res1) {
        recall(getAllEurOdds, item, obj);
        return
    };
    res1.model.list.forEach(dataItem => {
        if (dataItem.providerName == "威廉*") {
            obj["firstoddswiilian"] = [dataItem.firstWinOdds, dataItem.firstDrawOdds, dataItem.firstLoseOdds].join();
            obj["endoddswillian"] = [dataItem.winOdds, dataItem.drawOdds, dataItem.loseOdds].join();
            // obj["LoseRationwillianList"] = [dataItem.firstLoseRation, dataItem.loseRation].join();
        };
        if (dataItem.providerName == "立*") {
            obj["firstoddslibo"] = [dataItem.firstWinOdds, dataItem.firstDrawOdds, dataItem.firstLoseOdds].join();
            obj["endoddslibo"] = [dataItem.winOdds, dataItem.drawOdds, dataItem.loseOdds].join();
            // obj["LoseRationliboList"] = [dataItem.firstLoseRation, dataItem.loseRation].join();
        };
        if (dataItem.providerName == "澳*") {
            obj["firstoddsaomen"] = [dataItem.firstWinOdds, dataItem.firstDrawOdds, dataItem.firstLoseOdds].join();
            obj["endoddsaomen"] = [dataItem.winOdds, dataItem.drawOdds, dataItem.loseOdds].join();
            // obj["LoseRationaomenList"] = [dataItem.firstLoseRation, dataItem.loseRation].join();
        };
        if (dataItem.providerName == "36*") {
            obj["firstodds365"] = [dataItem.firstWinOdds, dataItem.firstDrawOdds, dataItem.firstLoseOdds].join();
            obj["endodds365"] = [dataItem.winOdds, dataItem.drawOdds, dataItem.loseOdds].join();
            // obj["LoseRationaomenList"] = [dataItem.firstLoseRation, dataItem.loseRation].join();
        };
    });
}

// 获取近6场的赛事结果
async function getSixResult(item, obj, callBack) {
    const params = {
        Number: 10,
        apiName: "getTeamNearStatusAicaiApi",
        bigSmallProviderId: 2,
        europeProviderId: 9999,
        handicapProviderId: 2,
        isHomeAway: 0,
        matchId: item.matchId,
        teamId: item.homeId,
    }
    let res2 = await postData('https://sport.ttyingqiu.com/sportdata/f?platform=web', params);
    // res2 = JSON.parse(res2);
    if (!res2) {
        recall(getSixResult, item, obj);
        return
    };
    obj["matchResultHome"] = "";
    let winNumber = 0;
    let drawNumber = 0;
    let loseNumber = 0;
    for (const item of res2.teamNearStatus.list) {
        if (item.leagueName != "球会友谊" && obj["matchResultHome"].length <= 5) {
            obj.matchResultHome += item.amidithion;
            if (item.amidithion == "胜") {
                winNumber += 1;
            } else if (item.amidithion == "平") {
                drawNumber += 1;
            } else {
                loseNumber += 1;
            };
        };
        if (obj["matchResultHome"].length == 6) {
            break;
        }
    };
    obj["homeSixMatch"] = winNumber + "-" + drawNumber + "-" + loseNumber;
    obj["homeGOal"] = res2.teamNearStatus?.goals + "-" + res2.teamNearStatus?.loseGoals;
}

// 获取近6场客队客场的赛事结果
async function getSixResultVisited(item, obj, callBack) {
    const params = {
        Number: 10,
        apiName: "getTeamNearStatusAicaiApi",
        bigSmallProviderId: 2,
        europeProviderId: 9999,
        handicapProviderId: 2,
        isHomeAway: 0,
        matchId: item.matchId,
        teamId: item.awayId,
    };
    let res4 = await postData('https://sport.ttyingqiu.com/sportdata/f?platform=web', params);
    if (!res4) {
        recall(getSixResultVisited, item, obj);
        return
    };
    obj["matchResultVisit"] = "";
    let winNumber = 0;
    let drawNumber = 0;
    let loseNumber = 0;
    for (const item of res4.teamNearStatus.list) {
        if (item.leagueName != "球会友谊" && obj["matchResultVisit"].length <= 5) {
            obj.matchResultVisit += item.amidithion;
            if (item.amidithion == "胜") {
                winNumber += 1;
            } else if (item.amidithion == "平") {
                drawNumber += 1;
            } else {
                loseNumber += 1;
            };
        };
        if (obj["matchResultVisit"].length == 6) {
            break;
        }
    };
    obj["visitedSixMatch"] = winNumber + "-" + drawNumber + "-" + loseNumber;
    obj["visitedGoal"] = res4.teamNearStatus?.goals + "-" + res4.teamNearStatus?.loseGoals;
}

// 亚盘
async function getAsia(item, obj, callBack) {
    const params = {
        apiName: "getFtAsiaAllAicaiOdds",
        matchId: item.matchId,
    };
    let res3 = await postData('https://sport.ttyingqiu.com/sportdata/f?platform=web', params);
    if (!res3) {
        recall(getAsia, item, obj);
        return
    };
    res3.list.forEach(asia => {
        // asia.providerName == "36*"
        if (asia.providerName == "36*") {
            obj['365First'] = [asia.odds[0].firstHomeWinOdds, asia.odds[0].firstHandicap, asia.odds[0].firstAwayWinOdds].join();
            obj['365End'] = [asia.odds[0].homeWinOdds, asia.odds[0].handicap, asia.odds[0].awayWinOdds].join();
        };
    });
    obj["homeLevel"] = await getQIuDuiRanks(obj.ThreeSeasonAverageHome, obj.homeTeamLeageaName);
    obj["awayLevel"] = await getQIuDuiRanks(obj.ThreeSeasonAverageAway, obj.visitedTeamLeageaName);
    delete obj["homeAndAwayMatchResult"];
    // console.log(obj["homeTeamShanglun"], "obj[0]");
    handicapDepth(obj);
    computeList['list'].push(obj);
    fs.writeFileSync('./src/data/newDataFootball.json', JSON.stringify(computeList), "UTF-8");
}

function handicapDepth(obj) {
    let levelSubPositioning = 0;
    let realityHandicap = obj['365First'] ? convertHandicap(obj['365First'].split(",")[1]) : "";
    let historyHandicap = 0;
    let ChuShangLun = obj['365ChuShangLun'];
    obj['levelSubPositioning'] = obj["homeLevel"] - obj["awayLevel"];
    if (obj['365ChuShangLun']) {
        if (obj['365ChuShangLun'].indexOf("/") === -1) {
            // if (obj["365ChuShangLun"].indexOf("-") != -1) {
            //     historyHandicap = Number(obj['365ChuShangLun']);
            // } else {
            //     historyHandicap = Number(obj['365ChuShangLun']);
            // };
            historyHandicap = Number(obj['365ChuShangLun']);
        } else {
            if (obj["365ChuShangLun"].indexOf("-") != -1) {
                ChuShangLun = obj["365ChuShangLun"].slice(1);
                let spList = ChuShangLun.split("/");
                historyHandicap = -(Number(spList[1]) + Number(spList[0])) / 2;
            } else {
                let spList = obj['365ChuShangLun'].split("/");
                console.log(spList, "spList");
                historyHandicap = (Number(spList[1]) + Number(spList[0])) / 2;
            };
        };
        obj["真实盘口"] = convertHandicap(obj['365First'].split(",")[1]);
        obj["变化盘口"] = convertHandicap(obj['365End'].split(",")[1]);
        obj["历史盘口"] = historyHandicap;
        if (obj.whoIsSrong.indexOf("-") != -1) {
        } else if (obj.whoIsSrong.indexOf("+") != -1) {
        } else {
            if (obj['365First'].indexOf('受') != -1) {
            } else {
            };
        };
    }
    if (obj["homeTeamShanglun"]) {
        if (Math.abs(obj["levelSubPositioning"]) == 0) {
            if (obj["homeTeam"] == obj["homeTeamShanglun"]) {
                obj["theoryHandicap"] = obj["历史盘口"];
            } else {
                if (Math.abs(obj["历史盘口"]) > 0.5) {
                    if (obj["历史盘口"] < 0) {
                        obj["theoryHandicap"] = obj["历史盘口"];
                    } else {
                        obj["theoryHandicap"] = -(obj["历史盘口"] - 0.5);
                    }
                } else {
                    obj["theoryHandicap"] = obj["历史盘口"];
                }
            };
        } else {
            if (obj["homeTeam"] == obj["homeTeamShanglun"]) {
                obj["theoryHandicap"] = obj["历史盘口"];
            } else {
                if (obj["历史盘口"] <= 0) {
                    obj["theoryHandicap"] = (Math.abs(obj["历史盘口"]) + 0.5);
                } else {
                    if (Math.abs(obj["历史盘口"]) > 0.5) {
                        obj["theoryHandicap"] = -(obj["历史盘口"] - 0.5);
                    } else {
                        if (Math.abs(obj["历史盘口"]) == 0.5) {
                            obj["theoryHandicap"] = (obj["历史盘口"] - 0.5);
                        } else {
                            if (Math.abs(obj["levelSubPositioning"]) >= 0.5) {
                                obj["theoryHandicap"] = (obj["历史盘口"] - 0.5);
                            } else {
                                obj["theoryHandicap"] = obj["历史盘口"];
                            }
                        }
                    };
                };
            }
        };
    }
}


function isJudgeUpOrDown(levelSubPositioning, realityHandicap, historyHandicap) {
    levelSubPositioning = Math.abs(levelSubPositioning);
    realityHandicap = Math.abs(realityHandicap);
    historyHandicap = Math.abs(historyHandicap);
}

function convertHandicap(position) {
    if (position == "平手") {
        return 0
    } else if (position == "平半" || position == "平/半" || position == "受平/半") {
        if (position.indexOf('受') != -1) {
            return -0.25
        } else {
            return 0.25
        };
    } else if (position == "半球" || position == "受半球") {
        if (position.indexOf('受') != -1) {
            return -0.5
        } else {
            return 0.5
        };
    } else if (position == "半一" || position == "半球/一球" || position == "受半球/一球") {
        if (position.indexOf('受') != -1) {
            return -0.75
        } else {
            return 0.75
        };
    } else if (position == "一球" || position == "受一球") {
        if (position.indexOf('受') != -1) {
            return -1
        } else {
            return 1
        };
    } else if (position == "一球/球半" || position == "受一球/球半") {
        if (position.indexOf('受') != -1) {
            return -1.25
        } else {
            return 1.25
        };
    } else if (position == "球半" || position == "受球半") {
        if (position.indexOf('受') != -1) {
            return -1.5
        } else {
            return 1.5
        };
    } else if (position == "球半/两球" || position == "受球半/两球") {
        if (position.indexOf('受') != -1) {
            return -1.75
        } else {
            return 1.75
        };
    } else if (position == "两球" || position == "受两球") {
        if (position.indexOf('受') != -1) {
            return -2
        } else {
            return 2
        };
    } else if (position == "两球/两球半" || position == "受两球/两球半") {
        if (position.indexOf('受') != -1) {
            return -2.5
        } else {
            return 2.5
        };
    };
}


async function getQIuDuiRanks(ThreeSeasonAverageHome, leageaName) {
    console.log(ThreeSeasonAverageHome, leageaName);
    let rank = 0;
    switch (leageaName) {
        case "英超":
            rank = setTeamRankYingChao(ThreeSeasonAverageHome);
            break;
        case "英冠":
            rank = setTeamRankYingGuan(ThreeSeasonAverageHome);
            break;
        case "意甲":
            rank = setTeamRankYiJia(ThreeSeasonAverageHome);
            break;
        case "德甲":
            rank = setTeamRankDeJia(ThreeSeasonAverageHome);
            break;
        case "德乙":
            rank = setTeamRankDeYi(ThreeSeasonAverageHome);
            break;
        case '日职联':
            rank = setTeamRankRiZhiLian(ThreeSeasonAverageHome);
            break;
        case '法甲':
            rank = setTeamRankFaJia(ThreeSeasonAverageHome);
            break;
        case '法乙':
            rank = setTeamRank20(ThreeSeasonAverageHome);
            break;
        case '西甲':
            rank = setTeamRankXiJia(ThreeSeasonAverageHome);
            break;
        case '日职乙':
            rank = setTeamRankRiZhiYi(ThreeSeasonAverageHome);
            break;
        case '荷乙':
            return setTeamRankHeYi(ThreeSeasonAverageHome);
            break;
        case '荷甲':
            rank = setTeamRankHeJia(ThreeSeasonAverageHome);
            break;
        case '韩K联':
            rank = setTeamRank12(ThreeSeasonAverageHome);
            break;
        case '挪超':
            rank = setTeamRankNuoChao(ThreeSeasonAverageHome);
            break;
        case '瑞典超':
            rank = setTeamRankRuiChao(ThreeSeasonAverageHome);
            break;
        default:
            rank = setTeamRank20(ThreeSeasonAverageHome);
            break;
    };
    return rank
}

function setTeamRankXiJia(rank) {
    if (rank < 3 && rank >= 1) {
        return 1
    } else if (rank >= 4 && rank <= 7) {
        return 0.75
    } else if (rank > 7 && rank <= 12) {
        return 0.5
    } else if (rank > 12 && rank <= 17) {
        return 0.25
    } else {
        return 0
    }
}

function setTeamRankRiZhiYi(rank) {
    if (rank <= 3 && rank >= 1) {
        return 1
    } else if (rank > 3 && rank <= 8) {
        return 0.75
    } else if (rank > 8 && rank <= 12) {
        return 0.5
    } else if (rank > 12 && rank <= 16) {
        return 0.25
    } else {
        return 0
    }
}

function setTeamRankRiZhiLian(rank) {
    if (rank <= 3 && rank >= 1) {
        return 1
    } else if (rank > 3 && rank <= 6) {
        return 0.75
    } else if (rank > 6 && rank <= 12) {
        return 0.5
    } else if (rank > 12 && rank <= 16) {
        return 0.25
    } else {
        return 0
    }
}

function setTeamRankHeYi(rank) {
    if (rank <= 1 && rank >= 1) {
        return 1
    } else if (rank > 1 && rank <= 8) {
        return 0.75
    } else if (rank > 8 && rank <= 15) {
        return 0.5
    } else if (rank > 15 && rank <= 18) {
        return 0.25
    } else {
        return 0
    }
}

function setTeamRankNuoChao(rank) {
    if (rank <= 1 && rank >= 1) {
        return 1
    } else if (rank > 1 && rank <= 5) {
        return 0.75
    } else if (rank > 5 && rank <= 10) {
        return 0.5
    } else if (rank > 10 && rank <= 15) {
        return 0.25
    } else {
        return 0
    }
}

function setTeamRankRuiChao(rank) {
    if (rank <= 2 && rank >= 1) {
        return 1
    } else if (rank > 2 && rank <= 4) {
        return 0.75
    } else if (rank > 4 && rank <= 10) {
        return 0.5
    } else if (rank > 10 && rank <= 14) {
        return 0.25
    } else {
        return 0
    }
}

function setTeamRankHeJia(rank) {
    if (rank <= 2 && rank >= 1) {
        return 1
    } else if (rank > 2 && rank <= 5) {
        return 0.75
    } else if (rank > 5 && rank <= 9) {
        return 0.5
    } else if (rank > 10 && rank <= 16) {
        return 0.25
    } else {
        return 0
    }
}

function setTeamRankFaJia(rank) {
    if (rank <= 3 && rank >= 1) {
        return 1
    } else if (rank > 3 && rank <= 8) {
        return 0.75
    } else if (rank > 8 && rank <= 11) {
        return 0.5
    } else if (rank > 11 && rank <= 17) {
        return 0.25
    } else {
        return 0
    }
}

function setTeamRankYingChao(rank) {
    if (rank <= 3 && rank >= 1) {
        return 1
    } else if (rank > 3 && rank <= 8) {
        return 0.75
    } else if (rank > 8 && rank <= 11) {
        return 0.5
    } else if (rank > 11 && rank <= 17) {
        return 0.25
    } else {
        return 0
    }
}


function setTeamRankYingGuan(rank) {
    if (rank <= 4 && rank >= 1) {
        return 1
    } else if (rank > 4 && rank <= 8) {
        return 0.75
    } else if (rank > 8 && rank <= 14) {
        return 0.5
    } else if (rank > 14 && rank <= 19) {
        return 0.25
    } else {
        return 0
    }
}

function setTeamRankYiJia(rank) {
    if (rank <= 1 && rank >= 1) {
        return 1
    } else if (rank > 1 && rank <= 7) {
        return 0.75
    } else if (rank > 7 && rank <= 12) {
        return 0.5
    } else if (rank > 12 && rank <= 19) {
        return 0.25
    } else {
        return 0
    }
}

function setTeamRankDeJia(rank) {
    if (rank <= 2 && rank >= 1) {
        return 1
    } else if (rank > 2 && rank <= 6) {
        return 0.75
    } else if (rank > 6 && rank <= 10) {
        return 0.5
    } else if (rank > 10 && rank <= 15) {
        return 0.25
    } else {
        return 0
    }
}

function setTeamRankDeYi(rank) {
    if (rank <= 3 && rank >= 1) {
        return 1
    } else if (rank > 3 && rank <= 7) {
        return 0.75
    } else if (rank > 7 && rank <= 11) {
        return 0.5
    } else if (rank > 11 && rank <= 17) {
        return 0.25
    } else {
        return 0
    }
}

// 联赛队伍等于20时
function setTeamRank20(rank, teamObj) {
    if (rank <= 4 && rank >= 1) {
        return 1
    } else if (rank > 4 && rank <= 8) {
        return 0.75
    } else if (rank > 8 && rank <= 12) {
        return 0.5
    } else if (rank > 12 && rank <= 16) {
        return 0.25
    } else {
        return 0
    };
}


function setTeamRank22(rank, teamObj) {
    if (rank <= 4 && rank >= 1) {
        return 1
    } else if (rank > 4 && rank <= 8) {
        return 0.75
    } else if (rank > 8 && rank <= 12) {
        return 0.5
    } else if (rank > 14 && rank <= 18) {
        return 0.25
    } else {
        return 0
    };
}

// 联赛队伍等于24时
function setTeamRank24(rank, teamObj) {
    if (rank <= 3 && rank >= 1) {
        return 1
    } else if (rank > 3 && rank <= 8) {
        return 0.75
    } else if (rank > 8 && rank <= 14) {
        return 0.5
    } else if (rank > 14 && rank <= 20) {
        return 0.25
    } else {
        return 0
    };
}

// 联赛队伍等于18时
function setTeamRank18(rank, teamObj) {
    if (rank <= 3 && rank >= 1) {
        return 1
    } else if (rank > 3 && rank <= 8) {
        return 0.75
    } else if (rank > 8 && rank <= 12) {
        return 0.5
    } else if (rank > 12 && rank <= 16) {
        return 0.25
    } else {
        return 0
    };
}

// 联赛队伍等于12时
function setTeamRank12(rank, teamObj) {
    if (rank <= 2 && rank >= 1) {
        return 1
    } else if (rank > 3 && rank <= 4) {
        return 0.75
    } else if (rank > 4 && rank <= 8) {
        return 0.5
    } else if (rank > 8 && rank <= 10) {
        return 0.25
    } else {
        return 0
    };
}



// 计算概率转化后的盘口
function getTransformPankou(probilit, obj, type) {
    if (probilit >= 0.25 && probilit <= 0.5) {
        if (probilit >= 0.25 && probilit < 0.3) {
            obj['panxing' + type] = '平手/超高水';
            obj['shuiwei' + type] = (1.2 - (probilit - 0.25) * 2).toFixed(2);
        } else if (probilit >= 0.3 && probilit < 0.35) {
            obj['panxing' + type] = '平手/高水';
            obj['shuiwei' + type] = (1.1 - (probilit - 0.3) * 2).toFixed(2);
        } else if (probilit >= 0.35 && probilit < 0.4) {
            obj['panxing' + type] = '平手/中高水';
            obj['shuiwei' + type] = (1 - (probilit - 0.35)).toFixed(2);
        } else if (probilit >= 0.4 && probilit < 0.45) {
            obj['panxing' + type] = '平手/中水';
            obj['shuiwei' + type] = (0.95 - (probilit - 0.4)).toFixed(2);
        } else if (probilit >= 0.45 && probilit <= 0.5) {
            obj['panxing' + type] = '平手/中低水';
            obj['shuiwei' + type] = (0.9 - (probilit - 0.45)).toFixed(2);
        }
        // obj["ranPanType"] = "谁赢谁全赢，打平走水";
    } else if (probilit > 0.5 && probilit <= 0.75) {
        if (probilit > 0.5 && probilit < 0.55) {
            obj['panxing' + type] = '平半/超高水';
            obj['shuiwei' + type] = (1.2 - (probilit - 0.5) * 2).toFixed(2);
        } else if (probilit >= 0.55 && probilit < 0.60) {
            obj['panxing' + type] = '平半/高水';
            obj['shuiwei' + type] = (1.05 - (probilit - 0.55)).toFixed(2);
        } else if (probilit >= 0.6 && probilit < 0.65) {
            obj['panxing' + type] = '平半/中高水';
            obj['shuiwei' + type] = (1 - (probilit - 0.6)).toFixed(2);
        } else if (probilit >= 0.65 && probilit < 0.7) {
            obj['panxing' + type] = '平半/中水';
            obj['shuiwei' + type] = (0.95 - (probilit - 0.65)).toFixed(2);
        } else if (probilit >= 0.7 && probilit <= 0.75) {
            obj['panxing' + type] = '平半/中低水';
            obj['shuiwei' + type] = (0.9 - (probilit - 0.7)).toFixed(2);
        }
        // obj["ranPanType"] = "打平输一半，赢一球全赢";
    } else if (probilit > 0.75 && probilit <= 1.1) {
        if (probilit > 0.75 && probilit < 0.8) {
            obj['panxing' + type] = '半球/超高水';
            obj['shuiwei' + type] = (1.2 - (probilit - 0.75) * 2).toFixed(2);
        } else if (probilit >= 0.8 && probilit < 0.85) {
            obj['panxing' + type] = '半球/高水';
            obj['shuiwei' + type] = (1.05 - (probilit - 0.8)).toFixed(2);
        } else if (probilit >= 0.85 && probilit < 0.90) {
            obj['panxing' + type] = '半球/中高水';
            obj['shuiwei' + type] = (1 - (probilit - 0.85)).toFixed(2);
        } else if (probilit >= 0.9 && probilit < 0.95) {
            obj['panxing' + type] = '半球/中水';
            obj['shuiwei' + type] = (0.95 - (probilit - 0.9)).toFixed(2);
        } else if (probilit >= 0.95 && probilit < 1.0) {
            obj['panxing' + type] = '半球/中低水';
            obj['shuiwei' + type] = (0.9 - (probilit - 0.95)).toFixed(2);
        } else if (probilit >= 1 && probilit < 1.05) {
            obj['panxing' + type] = '半球/低水';
            obj['shuiwei' + type] = (0.85 - (probilit - 1)).toFixed(2);
        } else if (probilit >= 1.05 && probilit <= 1.1) {
            obj['panxing' + type] = '半球/超低水';
            obj['shuiwei' + type] = (0.8 - (probilit - 1.05)).toFixed(2);
        };
        // obj["ranPanType"] = "打平全输，赢一球全赢";
    } else if (probilit > 1.1 && probilit <= 1.5) {
        if (probilit > 1.1 && probilit <= 1.2) {
            obj['panxing' + type] = '半球/超低水';
            obj['shuiwei' + type] = (0.7 - (probilit - 1.1) / 2).toFixed(2);
        } else if (probilit >= 1.2 && probilit < 1.3) {
            obj['panxing' + type] = '半一/超高水';
            obj['shuiwei' + type] = (1.2 - (probilit - 1.2) * 2).toFixed(2);
        } else if (probilit >= 1.3 && probilit < 1.35) {
            obj['panxing' + type] = '半一/高水';
            obj['shuiwei' + type] = (1.1 - (probilit - 1.3) * 2).toFixed(2);
        } else if (probilit >= 1.35 && probilit < 1.4) {
            obj['panxing' + type] = '半一/中高水';
            obj['shuiwei' + type] = (1 - (probilit - 1.35)).toFixed(2);
        } else if (probilit >= 1.4 && probilit <= 1.45) {
            obj['panxing' + type] = '半一/中水';
            obj['shuiwei' + type] = (0.95 - (probilit - 1.4)).toFixed(2);
        } else if (probilit > 1.45 && probilit <= 1.5) {
            obj['panxing' + type] = '半一/中低水';
            obj['shuiwei' + type] = (0.90 - (probilit - 1.45)).toFixed(2);
        };
        // obj["ranPanType"] = "打平全输，净胜一球输一半，净胜两球全赢";
    } else if (probilit > 1.5 && probilit <= 2) {
        if (probilit > 1.5 && probilit <= 1.74) {
            obj['panxing' + type] = '半一/超低水';
            obj['shuiwei' + type] = '0.6 - 0.7'
        } else if (probilit >= 1.75 && probilit < 1.8) {
            obj['panxing' + type] = '一球/超高水';
            obj['shuiwei' + type] = (1.2 - (probilit - 1.75) * 2).toFixed(2);
        } else if (probilit >= 1.8 && probilit < 1.85) {
            obj['panxing' + type] = '一球/高水';
            obj['shuiwei' + type] = (1.1 - (probilit - 1.8) * 2).toFixed(2);
        } else if (probilit >= 1.85 && probilit < 1.9) {
            obj['panxing' + type] = '一球/中高水';
            obj['shuiwei' + type] = (1 - (probilit - 1.85)).toFixed(2);
        } else if (probilit >= 1.9 && probilit < 1.95) {
            obj['panxing' + type] = '一球/中水';
            obj['shuiwei' + type] = (0.95 - (probilit - 1.9)).toFixed(2);
        } else if (probilit >= 1.95 && probilit <= 2) {
            obj['panxing' + type] = '一球/中低水';
            obj['shuiwei' + type] = (0.90 - (probilit - 1.95)).toFixed(2);
        }
        // obj["ranPanType"] = "净胜一球算平，净胜两球全赢";
    } else {
        obj['panxing' + type] = "other";
        obj['shuiwei' + type] = 'other'
    }
    return obj
}







