class Node {
    constructor(featureIndex, threshold, left, right, prediction) {
        this.featureIndex = featureIndex;
        this.threshold = threshold;
        this.left = left;
        this.right = right;
        this.prediction = prediction;
    }
}

class DecisionTree {
    constructor(maxDepth = 12, minSize = 2) {
        this.maxDepth = maxDepth;
        this.minSize = minSize;
    }

    calculateGini(data) {
        const classCounts = {};
        for (let { label } of data) {
            classCounts[label] = (classCounts[label] || 0) + 1;
        }
        let gini = 1;
        const totalInstances = data.length;
        for (let labelCount of Object.values(classCounts)) {
            const probability = labelCount / totalInstances;
            gini -= probability ** 2;
        }
        return gini;
    }

    splitData(data, featureIndex, threshold) {
        const left = [];
        const right = [];
        for (let datum of data) {
            if (datum.features[featureIndex] < threshold) {
                left.push(datum);
            } else {
                right.push(datum);
            }
        }
        return [left, right];
    }

    findBestSplit(data) {
        let bestGini = Infinity;
        let bestSplit = null;
        let bestFeatureIndex = null;
        for (let featureIndex = 0; featureIndex < data[0].features.length; featureIndex++) {
            const featureValues = [...new Set(data.map(d => d.features[featureIndex]))];
            for (let threshold of featureValues) {
                const [left, right] = this.splitData(data, featureIndex, threshold);
                const gini = (left.length / data.length) * this.calculateGini(left) +
                    (right.length / data.length) * this.calculateGini(right);
                if (gini < bestGini) {
                    bestGini = gini;
                    bestSplit = [left, right];
                    bestFeatureIndex = featureIndex;
                }
            }
        }
        return { bestSplit, bestFeatureIndex };
    }

    buildTree(data, depth) {
        const classCounts = {};
        for (let { label } of data) {
            classCounts[label] = (classCounts[label] || 0) + 1;
        }
        const majorityClass = Object.keys(classCounts).reduce((a, b) => classCounts[a] > classCounts[b] ? a : b);
        if (depth >= this.maxDepth || data.length <= this.minSize || Object.keys(classCounts).length === 1) {
            return new Node(null, null, null, null, majorityClass);
        }

        const { bestSplit, bestFeatureIndex } = this.findBestSplit(data);
        if (!bestSplit) {
            return new Node(null, null, null, null, majorityClass);
        }

        const [leftData, rightData] = bestSplit;
        const leftChild = this.buildTree(leftData, depth + 1);
        const rightChild = this.buildTree(rightData, depth + 1);
        return new Node(bestFeatureIndex, data[0].features[bestFeatureIndex], leftChild, rightChild, null);
    }

    train(data) {
        if (data.length === 0) {
            throw new Error("Empty dataset provided.");
        }
        this.root = this.buildTree(data, 0);
    }

    predictSingle(datum, node) {
        if (node.prediction !== null) {
            return node.prediction;
        }
        if (datum.features[node.featureIndex] < node.threshold) {
            return this.predictSingle(datum, node.left);
        } else {
            return this.predictSingle(datum, node.right);
        }
    }

    predict(data) {
        return data.map(datum => this.predictSingle(datum, this.root));
    }
}

module.exports = {
    DecisionTree
}

// // 示例用法
// const data = [
//     { features: [2.771244718, 1.784783929], label: 0 },
//     { features: [1.728571309, 1.169761413], label: 0 },
//     { features: [3.678319846, 2.81281357], label: 0 },
//     { features: [3.961043357, 2.61995032], label: 0 },
//     { features: [2.999208922, 2.209014212], label: 0 },
//     { features: [7.497545867, 3.162953546], label: 1 },
//     { features: [9.00220326, 3.339047188], label: 1 },
//     { features: [7.444542326, 0.476683375], label: 1 },
//     { features: [10.12493903, 3.234550982], label: 1 },
//     { features: [6.642287351, 3.319983761], label: 1 }
// ];

// const decisionTree = new DecisionTree();
// decisionTree.train(data);
// const testData = [
//     { features: [1.1, 0.5] },
//     { features: [8, 3] },
//     { features: [9, 2.5] }
// ];
// const predictions = decisionTree.predict(testData);
// console.log(predictions);
