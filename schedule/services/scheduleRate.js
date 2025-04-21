'use strict';
const getNumHHMM = (hhmm) => (parseInt(hhmm.replace(':', '')));

const processScheduleRates = (scheduleRates) => {
    scheduleRates.sort((a, b) => getNumHHMM(a.time) - getNumHHMM(b.time));
    console.log('scheduleRates');
    console.log(scheduleRates);

    // page data processing
    const rates = scheduleRates.map(({ _, rate }) => parseFloat(rate));
    // console.log(rates);

    const getSumRate = (time, rates, i) => {
        const MAX_SUM_RATE = '1000.0';
        if (i > scheduleRates.map(sr => sr.time).indexOf('19:00')) {
            return MAX_SUM_RATE;
        }
        let sumRate = 0.0;
        for (let j = i; j < (i + 4); j++) {
            sumRate += (rates[j]);
        }
        return sumRate.toFixed(2);
    };

    scheduleRates = scheduleRates.map(({ time, rate }, i) => ({
        time: time,
        rate: rate,
        sumRate: getSumRate(time, rates, i)
    }));

    scheduleRates = scheduleRates.map(({ time, rate, sumRate }) => ({ time, rate, sumRate: parseFloat(sumRate) }));
    scheduleRates.sort((a, b) => a.sumRate - b.sumRate);
    scheduleRates = scheduleRates.map(({ time, rate, sumRate }) => ({ time, rate, sumRate: sumRate.toFixed(2) }));

    return scheduleRates;
};

export { processScheduleRates, getNumHHMM };