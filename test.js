function calCompoundInterest(investment, rate, days) {
    // let futureValue = investment * (Math.pow(1 + rate, days) - 1) / rate;
    // return futureValue;
    let futureValue = investment;
    for (let i = 1; i <= days; i++ ) {
        futureValue = (futureValue) * (1 + rate);
    }
    return futureValue;
}

let result = calCompoundInterest(1000, 0.005, 3);

console.log(result);