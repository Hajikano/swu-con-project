function LeastSquares(X, Y, computeError, ret) {
    if (typeof computeError == 'object') {
        ret = computeError
        computeError = false
    }

    if (typeof ret == 'undefined') ret = {}

    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumXSq = 0
    let N = X.length

    for (let i = 0; i < N; ++i) {
        sumX += X[i]
        sumY += Y[i]
        sumXY += X[i] * Y[i]
        sumXSq += X[i] * X[i]
    }

    ret.m = (sumXY - (sumX * sumY) / N) / (sumXSq - (sumX * sumX) / N)
    ret.b = sumY / N - (ret.m * sumX) / N

    if (computeError) {
        let varSum = 0
        for (let j = 0; j < N; ++j) {
            varSum += (Y[j] - ret.b - ret.m * X[j]) * (Y[j] - ret.b - ret.m * X[j])
        }

        let delta = N * sumXSq - sumX * sumX
        let vari = (1.0 / (N - 2.0)) * varSum

        ret.bErr = Math.sqrt((vari / delta) * sumXSq)
        ret.mErr = Math.sqrt((N / delta) * vari)
    }

    return function (x) {
        return ret.m * x + ret.b
    }
}

module.exports = {
    LeastSquares,
}
