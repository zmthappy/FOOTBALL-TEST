const data = require("../src/data/saveDataofRawDeep.json")
// const data = require("../data/saveDataofRawDeepTranform.json")
const data2 = require("../src/data/deepAanlysisTwo.json");
// const rawData = require("./src/data/newDataFootball.json");
let trainsDta = [];
let predictData = [];
let predictDataTeamName = [];
let result = [];

// 使用示例
const numTrees = 10;
const maxDepth = 5;
let numFeatures = 0;
// const rf = new RandomForest(numTrees, maxDepth, numFeatures);
// rf.train(X_train, y_train);
// const predictions = rf.predict(X_test);
// console.log(predictions);


function main(type) {
    for (const iterator of data) {
        let objSelft = []
        let objSeltTwo = [];
        // let = [];
        // objSelft.label = (iterator.matchResult);
        delete iterator.homeTeam
        let keyList11 = Object.keys(iterator);
        for (const item of keyList11) {
            objSelft.features.push(iterator[item]);
        }
        delete iterator.matchResult
        let keyList = Object.keys(iterator);
        for (const item of keyList) {
            objSeltTwo.features.push(iterator[item]);
        }
        if (objSeltTwo.features.length != 21) {
            numFeatures = objSeltTwo.features.length
            trainsDta.push(objSelft);
        };
    };
    for (const iterator of data2) {
        let objSelft = []
        predictDataTeamName.push(iterator.homeTeam);
        delete iterator.homeTeam
        let keyList = Object.keys(iterator);
        for (const item of keyList) {
            objSelft.features.push(iterator[item]);
        }
        predictData.push(objSelft);
    };
    console.log(predictData, trainsDta, numFeatures, "trainsDta");
    const RandomForest = new RandomForest(numTrees, maxDepth, numFeatures);
    RandomForest.train(trainsDta);
    // const predictions = decisionTree.predict(predictData);
    // let resultArray = [];
    // for (let i = 0; i < predictions.length; i++) {
    //     let obj = {
    //         homeTame: predictDataTeamName[i],
    //         result: predictions[i],
    //     };
    //     resultArray.push(obj);
    // }
    // console.log(resultArray);

}

main()

// 定义决策树节点类
class TreeNode {
    constructor(value, left, right) {
        this.value = value;
        this.left = left;
        this.right = right;
    }
}

// 定义随机森林类
class RandomForest {
    constructor(numTrees, maxDepth, numFeatures) {
        this.numTrees = numTrees;
        this.maxDepth = maxDepth;
        this.numFeatures = numFeatures;
        this.trees = [];
    }

    // 训练随机森林
    train(X, y) {
        for (let i = 0; i < this.numTrees; i++) {
            // 随机选择特征
            let selectedFeatures = this.selectFeatures(X[0].length);
            // 从训练集中随机选择样本（有放回）
            let bootstrapSamples = this.bootstrap(X, y);
            // 构建决策树
            let tree = this.buildTree(bootstrapSamples, selectedFeatures, 0);
            this.trees.push(tree);
        }
    }

    // 预测
    predict(X) {
        let predictions = [];
        for (let i = 0; i < X.length; i++) {
            let treePredictions = [];
            for (let j = 0; j < this.numTrees; j++) {
                let prediction = this.predictTree(X[i], this.trees[j]);
                treePredictions.push(prediction);
            }
            // 取多棵树的投票结果作为最终预测
            let majorityVote = this.majorityVote(treePredictions);
            predictions.push(majorityVote);
        }
        return predictions;
    }

    // 从特征集中随机选择特征
    selectFeatures(numFeatures) {
        let selectedFeatures = [];
        while (selectedFeatures.length < this.numFeatures) {
            let featureIndex = Math.floor(Math.random() * numFeatures);
            if (!selectedFeatures.includes(featureIndex)) {
                selectedFeatures.push(featureIndex);
            }
        }
        return selectedFeatures;
    }

    // 从训练集中有放回地抽样
    bootstrap(X, y) {
        let bootstrapSamples = [];
        for (let i = 0; i < X.length; i++) {
            let randomIndex = Math.floor(Math.random() * X.length);
            bootstrapSamples.push({ X: X[randomIndex], y: y[randomIndex] });
        }
        return bootstrapSamples;
    }

    // 构建决策树
    buildTree(samples, selectedFeatures, depth) {
        // 如果达到最大深度或者样本集为空，则返回叶节点
        if (depth >= this.maxDepth || samples.length === 0) {
            return this.createLeafNode(samples);
        }

        // 如果所有样本属于同一类别，则返回叶节点
        if (this.isSameClass(samples)) {
            return this.createLeafNode(samples);
        }

        // 选择最优划分特征和阈值
        let { bestFeature, bestThreshold, leftSamples, rightSamples } = this.findBestSplit(samples, selectedFeatures);

        // 如果无法找到合适的划分，则返回叶节点
        if (bestFeature === null) {
            return this.createLeafNode(samples);
        }

        // 递归构建左右子树
        let leftChild = this.buildTree(leftSamples, selectedFeatures, depth + 1);
        let rightChild = this.buildTree(rightSamples, selectedFeatures, depth + 1);

        // 返回当前节点
        return new TreeNode({ featureIndex: bestFeature, threshold: bestThreshold }, leftChild, rightChild);
    }

    // 创建叶节点
    createLeafNode(samples) {
        let classCounts = {};
        samples.forEach(sample => {
            let label = sample.y;
            if (classCounts[label] === undefined) {
                classCounts[label] = 1;
            } else {
                classCounts[label]++;
            }
        });

        // 找到样本中出现次数最多的类别作为叶节点的预测类别
        let maxCount = 0;
        let leafValue = null;
        for (let label in classCounts) {
            if (classCounts[label] > maxCount) {
                maxCount = classCounts[label];
                leafValue = label;
            }
        }

        return new TreeNode(leafValue, null, null);
    }

    // 判断样本是否属于同一类别
    isSameClass(samples) {
        let firstLabel = samples[0].y;
        for (let i = 1; i < samples.length; i++) {
            if (samples[i].y !== firstLabel) {
                return false;
            }
        }
        return true;
    }

    // 找到最优划分特征和阈值
    findBestSplit(samples, selectedFeatures) {
        // 省略找到最优划分的代码
    }

    // 预测单个样本
    predictTree(sample, tree) {
        if (tree.left === null && tree.right === null) {
            return tree.value;
        }

        let { featureIndex, threshold } = tree.value;
        if (sample[featureIndex] <= threshold) {
            return this.predictTree(sample, tree.left);
        } else {
            return this.predictTree(sample, tree.right);
        }
    }

    // 多数投票
    majorityVote(predictions) {
        let counts = {};
        // 统计每个类别的投票次数
        for (let i = 0; i < predictions.length; i++) {
            let prediction = predictions[i];
            if (counts[prediction] === undefined) {
                counts[prediction] = 1;
            } else {
                counts[prediction]++;
            }
        }

        let majorityClass = null;
        let maxCount = 0;
        // 找到投票次数最多的类别
        for (let label in counts) {
            if (counts[label] > maxCount) {
                maxCount = counts[label];
                majorityClass = label;
            }
        }

        return majorityClass;
    }

}
