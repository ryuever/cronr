(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Cronr"] = factory();
	else
		root["Cronr"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Cronr.ts":
/*!**********************!*\
  !*** ./src/Cronr.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst CronrCounter_1 = __webpack_require__(/*! ./CronrCounter */ \"./src/CronrCounter.ts\");\nconst utils_1 = __webpack_require__(/*! ./utils */ \"./src/utils/index.ts\");\nconst { toNum } = utils_1.default;\nconst INITIAL = \"initial\";\nconst RUNNING = \"running\";\nconst SUSPEND = \"suspend\";\nconst CLEAR = \"clear\";\nclass Cronr {\n    constructor(pattern, cb, opts = {\n        immediate: false,\n        startTime: new Date()\n    }) {\n        this.pattern = pattern;\n        this.cb = cb;\n        const { startTime, immediate } = opts;\n        this.counter = new CronrCounter_1.default({\n            pattern: this.pattern,\n            ts: startTime\n        });\n        this.iterator = this.counter.result;\n        this.immediate = immediate;\n        this.status = INITIAL;\n        this.endTime = opts.endTime;\n    }\n    resolveNextValidAction(status) {\n        switch (status) {\n            case INITIAL:\n                return [\"start\"];\n            case RUNNING:\n                return [\"stop\", \"clear\"];\n            case SUSPEND:\n                return [\"clear\", \"resume\"];\n            case CLEAR:\n                return [\"restart\"];\n        }\n    }\n    start(bypass) {\n        if (this.status !== INITIAL) {\n            throw new Error(this.msg(this.status));\n        }\n        if (!bypass && this.immediate) {\n            this.cb.call(null);\n        }\n        const now = new Date();\n        let nextTick = this.iterator.next().value;\n        // To make sure nextTick must not less than `now`;\n        while (nextTick < now) {\n            nextTick = this.iterator.next().value;\n        }\n        let timeout = toNum(nextTick) - toNum(now);\n        // To avoid dulplicate running;\n        if (timeout === 0 && this.immediate) {\n            nextTick = this.iterator.next().value;\n            timeout = toNum(nextTick) - toNum(now);\n        }\n        this.nextTick = nextTick;\n        const callback = () => {\n            this.cb.call(this);\n            const nextTick = this.iterator.next().value;\n            if (!this.endTime || this.endTime > nextTick) {\n                const timeout = toNum(nextTick) - toNum(new Date());\n                this.nextTick = nextTick;\n                this.timeoutId = setTimeout(callback, timeout);\n            }\n        };\n        this.timeoutId = setTimeout(callback, timeout);\n        this.status = RUNNING;\n    }\n    msg(status) {\n        return (`Current status is '${status}', ` +\n            `you can only do ${JSON.stringify(this.resolveNextValidAction(status))} action`);\n    }\n    // the next action should be `resume`;\n    stop() {\n        if (this.status !== RUNNING) {\n            throw new Error(this.msg(this.status));\n        }\n        clearTimeout(this.timeoutId);\n        this.status = SUSPEND;\n    }\n    // the next action should be `restart`;\n    clear() {\n        if (this.status !== RUNNING && this.status !== SUSPEND) {\n            throw new Error(this.msg(this.status));\n        }\n        clearTimeout(this.timeoutId);\n        this.status = CLEAR;\n    }\n    restart() {\n        if (this.status !== CLEAR) {\n            throw new Error(this.msg(this.status));\n        }\n        this.status = INITIAL;\n        this.start();\n    }\n    resume() {\n        if (this.status !== SUSPEND) {\n            throw new Error(this.msg(this.status));\n        }\n        this.status = INITIAL;\n        this.start(true);\n    }\n}\nexports.default = Cronr;\n\n\n//# sourceURL=webpack://Cronr/./src/Cronr.ts?");

/***/ }),

/***/ "./src/CronrCounter.ts":
/*!*****************************!*\
  !*** ./src/CronrCounter.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst Resolver_1 = __webpack_require__(/*! ./Resolver */ \"./src/Resolver.ts\");\nclass CronrCounter {\n    constructor(opts) {\n        const { name, pattern, ts } = opts;\n        this.name = name;\n        this.resolver = new Resolver_1.default({\n            pattern,\n            ts\n        });\n        this.result = this.resolver[Symbol.iterator]();\n    }\n}\nexports.default = CronrCounter;\n\n\n//# sourceURL=webpack://Cronr/./src/CronrCounter.ts?");

/***/ }),

/***/ "./src/Pattern.ts":
/*!************************!*\
  !*** ./src/Pattern.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst Token_1 = __webpack_require__(/*! ./Token */ \"./src/Token.ts\");\nconst Unit_1 = __webpack_require__(/*! ./Unit */ \"./src/Unit.ts\");\nconst MILLISECOND_BASED = Symbol(\"millisecond_base\");\nconst SECOND_BASED = Symbol(\"second_based\");\nconst MINUTE_BASED = Symbol(\"minute_base\");\nclass Pattern {\n    constructor(pattern) {\n        this.milliSecondToken = Object.create(null);\n        this.secondToken = Object.create(null);\n        this.minuteToken = Object.create(null);\n        this.hourToken = Object.create(null);\n        this.dayToken = Object.create(null);\n        this.monthToken = Object.create(null);\n        this.weekdayToken = Object.create(null);\n        this.pattern = pattern;\n        this.type = MILLISECOND_BASED;\n    }\n    static create(pattern) {\n        const instance = new Pattern(pattern);\n        instance.initToken();\n        return instance;\n    }\n    patternParts() {\n        return this.pattern.split(\" \");\n    }\n    /**\n     * The first one which is not `*` will determine the next timestamp's plus step.\n     */\n    resolveStep() {\n        const len = this.fullPatternParts.length;\n        let i = 0;\n        for (; i < len; i++) {\n            if (this.fullPatternParts[i] !== \"*\") {\n                break;\n            }\n        }\n        if (i !== len) {\n            const options = this[`${Unit_1.units[i]}Token`].resolvedOptions();\n            return options.step;\n        }\n        switch (this.type) {\n            case MILLISECOND_BASED:\n                return 1;\n            case SECOND_BASED:\n                return 1 * 1000;\n            case MINUTE_BASED:\n                return 1 * 60 * 1000;\n            default:\n                return 1;\n        }\n    }\n    initToken() {\n        let parts = this.patternParts();\n        const len = parts.length;\n        if (len < 5 || len > 7)\n            throw new Error(\"Invalid pattern\");\n        if (len === 5) {\n            parts = [\"*\", \"*\"].concat(parts);\n            this.type = MINUTE_BASED;\n        }\n        if (len === 6) {\n            parts = [\"*\"].concat(parts);\n            this.type = SECOND_BASED;\n        }\n        this.fullPatternParts = parts;\n        parts.forEach((part, i) => (this[`${Unit_1.units[i]}Token`] = Token_1.default.create(part, Unit_1.units[i])));\n    }\n}\nexports.default = Pattern;\n\n\n//# sourceURL=webpack://Cronr/./src/Pattern.ts?");

/***/ }),

/***/ "./src/Resolver.ts":
/*!*************************!*\
  !*** ./src/Resolver.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst Pattern_1 = __webpack_require__(/*! ./Pattern */ \"./src/Pattern.ts\");\nconst utils_1 = __webpack_require__(/*! ./utils */ \"./src/utils/index.ts\");\nconst Unit_1 = __webpack_require__(/*! ./Unit */ \"./src/Unit.ts\");\nconst resolveTsParts_1 = __webpack_require__(/*! ./utils/resolveTsParts */ \"./src/utils/resolveTsParts.ts\");\nconst { min, toNum } = utils_1.default;\nclass Resolver {\n    constructor(opts) {\n        const { pattern, ts } = opts;\n        const patternInstance = Pattern_1.default.create(pattern);\n        const { milliSecondToken, secondToken, minuteToken, hourToken, dayToken, monthToken, weekdayToken } = patternInstance;\n        this.pattern = patternInstance;\n        this.milliSecondToken = milliSecondToken;\n        this.secondToken = secondToken;\n        this.minuteToken = minuteToken;\n        this.hourToken = hourToken;\n        this.dayToken = dayToken;\n        this.monthToken = monthToken;\n        this.weekdayToken = weekdayToken;\n        // `originTs` served as the base ts; It aims to calculate to nextTs's offset.\n        this.originTs = ts || new Date();\n        // plus one millisecond\n        // this.ts = new Date(toNum(this.originTs) + 1);\n        this.ts = new Date(toNum(this.originTs));\n        this.nextTs = undefined;\n    }\n    [Symbol.iterator]() {\n        return {\n            next: () => {\n                this.prevTs = new Date(toNum(this.ts));\n                const nextTime = this.nextTimeToCall();\n                const step = this.pattern.resolveStep();\n                this.ts = new Date(toNum(nextTime) + step);\n                return {\n                    value: nextTime,\n                    done: false\n                };\n            }\n        };\n    }\n    /**\n     * Accroding to the time pattern and this.ts to calculate the nextTime\n     * abide to the `cron time pattern`\n     */\n    nextTimeToCall() {\n        const len = Unit_1.units.length;\n        this.traverse(Unit_1.units[len - 2], this.ts);\n        return this.ts;\n    }\n    normalizeTsValueAfterUnit(unit, ts, inclusive) {\n        const index = Unit_1.units.indexOf(unit);\n        let max = index;\n        if (inclusive) {\n            max = index + 1;\n        }\n        for (let i = 0; i < max; i++) {\n            const unit = Unit_1.units[i];\n            const token = this.getTokenByUnit(unit);\n            const options = token.resolvedOptions();\n            const { setCallee, min } = options;\n            ts[setCallee](min);\n        }\n    }\n    decorateTsWithClosestValidValueAfterUnit(unit, ts, inclusive) {\n        const index = Unit_1.units.indexOf(unit);\n        let max = index;\n        if (inclusive) {\n            max = index + 1;\n        }\n        for (let i = 0; i < max; i++) {\n            const unit = Unit_1.units[i];\n            const token = this.getTokenByUnit(unit);\n            const value = resolveTsParts_1.default(ts)[unit];\n            const newValue = token.findTheClosestValidValue(value, ts);\n            const options = token.resolvedOptions();\n            const { setCallee } = options;\n            ts[setCallee](newValue);\n        }\n    }\n    traverse(unit, ts) {\n        const index = Unit_1.units.indexOf(unit);\n        const token = this.getTokenByUnit(unit);\n        const info = resolveTsParts_1.default(ts);\n        const value = info[unit];\n        if (!this.checkIfTokenMatchsValue(token, value, info)) {\n            try {\n                const validValue = this.findTokenClosestValidValue(token, value, ts);\n                const { setCallee } = token.resolvedOptions();\n                ts[setCallee](validValue);\n                this.normalizeTsValueAfterUnit(unit, ts);\n                this.decorateTsWithClosestValidValueAfterUnit(unit, ts);\n                return;\n            }\n            catch (err) {\n                if (unit !== \"month\") {\n                    const parentUnit = Unit_1.units[index + 1];\n                    const parentToken = this.getTokenByUnit(parentUnit);\n                    const { setCallee } = parentToken.resolvedOptions();\n                    const parentValue = info[parentUnit];\n                    ts[setCallee](parentValue + 1);\n                    this.normalizeTsValueAfterUnit(parentUnit, ts);\n                    this.traverse(parentUnit, ts);\n                }\n                else {\n                    const year = ts.getFullYear();\n                    ts.setFullYear(year + 1);\n                    this.normalizeTsValueAfterUnit(unit, ts, true);\n                    this.decorateTsWithClosestValidValueAfterUnit(unit, ts, true);\n                }\n                return;\n            }\n        }\n        if (index > 0) {\n            this.traverse(Unit_1.units[index - 1], ts);\n        }\n    }\n    checkIfTokenMatchsValue(token, value, info) {\n        const unit = token.unit;\n        if (unit !== \"day\") {\n            return token.matchToken(value, info);\n        }\n        const weekdayToken = this.getTokenByUnit(\"weekday\");\n        const dayPattern = token.pattern;\n        const weekdayPattern = weekdayToken.pattern;\n        if (weekdayPattern === \"*\" && dayPattern === \"*\")\n            return true;\n        const dayMatch = token.matchToken(value, info);\n        const weekdayMatch = weekdayToken.matchToken(info.weekday, info);\n        if (weekdayPattern === \"*\" && dayPattern !== \"*\")\n            return dayMatch;\n        if (weekdayPattern !== \"*\" && dayPattern === \"*\")\n            return weekdayMatch;\n        return dayMatch || weekdayMatch;\n    }\n    findTokenClosestValidValue(token, value, ts) {\n        const unit = token.unit;\n        if (unit !== \"day\") {\n            return token.findTheClosestValidValue(value, ts);\n        }\n        const info = resolveTsParts_1.default(ts);\n        const weekdayToken = this.getTokenByUnit(\"weekday\");\n        const dayPattern = token.pattern;\n        const weekdayPattern = weekdayToken.pattern;\n        if (weekdayPattern === \"*\" && dayPattern === \"*\")\n            return value;\n        const dayMatch = token.matchToken(value, info);\n        const weekdayMatch = weekdayToken.matchToken(info.weekday, info);\n        let valueFromDayUnit = undefined;\n        let valueFromWeekdayUnit = undefined;\n        try {\n            valueFromDayUnit = token.findTheClosestValidValue(value, ts);\n        }\n        catch (err) {\n            if (weekdayPattern === \"*\" && dayPattern !== \"*\")\n                throw err;\n        }\n        if (weekdayPattern === \"*\" && dayPattern !== \"*\")\n            return valueFromDayUnit;\n        try {\n            valueFromWeekdayUnit = weekdayToken.findTheClosestValidValueForWeekday(value, ts);\n        }\n        catch (err) {\n            if (weekdayPattern !== \"*\" && dayPattern === \"*\")\n                throw err;\n        }\n        if (weekdayPattern !== \"*\" && dayPattern === \"*\")\n            return valueFromWeekdayUnit;\n        if (valueFromDayUnit && valueFromWeekdayUnit) {\n            return Math.min(valueFromDayUnit, valueFromWeekdayUnit);\n        }\n        throw new Error(\"Carry over to fetch again\");\n    }\n    getTokenByUnit(unit) {\n        return this[`${unit}Token`];\n    }\n}\nexports.default = Resolver;\n\n\n//# sourceURL=webpack://Cronr/./src/Resolver.ts?");

/***/ }),

/***/ "./src/Token.ts":
/*!**********************!*\
  !*** ./src/Token.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst Unit_1 = __webpack_require__(/*! ./Unit */ \"./src/Unit.ts\");\nconst tokenTypes_1 = __webpack_require__(/*! ./tokenTypes */ \"./src/tokenTypes.ts\");\nconst utils_1 = __webpack_require__(/*! ./utils */ \"./src/utils/index.ts\");\nconst resolveTsParts_1 = __webpack_require__(/*! ./utils/resolveTsParts */ \"./src/utils/resolveTsParts.ts\");\nconst tokenParser_1 = __webpack_require__(/*! ./tokenParser */ \"./src/tokenParser.ts\");\nconst { toNum } = utils_1.default;\nclass Token {\n    constructor(pattern, unit) {\n        this.pattern = pattern;\n        this.unit = unit;\n    }\n    static create(pattern, unit) {\n        return new Token(pattern, unit);\n    }\n    resolvedOptions() {\n        const ret = {};\n        if (!this.resolvedOptionsCache) {\n            this.resolvedOptionsCache = Unit_1.default.instance(this.unit);\n        }\n        return this.resolvedOptionsCache;\n    }\n    matchToken(data, dateInfo) {\n        const parts = this.formatToParts();\n        const literalParts = parts.filter((part) => part.type === tokenTypes_1.LITERAL);\n        const everyParts = parts.filter((part) => part.type === tokenTypes_1.EVERY);\n        let rangeParts = parts.filter((part) => part.type === tokenTypes_1.RANGE);\n        for (let i of literalParts) {\n            const { value } = i;\n            if (value === data)\n                return true;\n        }\n        let step = 1;\n        if (everyParts.length > 0) {\n            step = everyParts[0].value;\n        }\n        // pending to calculate day count\n        const { min, max } = this.resolvedOptions();\n        let nextMax = max;\n        if (typeof max === \"function\" && dateInfo)\n            nextMax = max(dateInfo);\n        // only if has type 'EVERY' will provide defualt rangeParts;\n        if (rangeParts.length === 0 && everyParts.length > 0) {\n            rangeParts = [\n                {\n                    type: tokenTypes_1.RANGE,\n                    value: { from: min, to: nextMax }\n                }\n            ];\n        }\n        for (let i of rangeParts) {\n            const from = i.value.from || min;\n            const to = i.value.to || nextMax;\n            for (let i = from; i <= to; i = i + step) {\n                if (data === i)\n                    return true;\n            }\n        }\n        return false;\n    }\n    /**\n     * value should be included\n     * Because the `max` value of `month` should be determined by `year` and `month`;\n     * there is a need of `ts` param;\n     */\n    findTheClosestValidValue(value, ts) {\n        const { max, min } = this.resolvedOptions();\n        const info = resolveTsParts_1.default(ts);\n        let nextMax = max;\n        if (typeof nextMax === \"function\") {\n            const year = ts.getFullYear();\n            const month = ts.getMonth();\n            nextMax = nextMax(info);\n        }\n        for (let i = value; i >= min && i <= nextMax; i++) {\n            if (this.matchToken(i, info)) {\n                return i;\n            }\n        }\n        throw new Error(\"Maybe you should carry over the number, then match again\");\n    }\n    findTheClosestValidValueForWeekday(value, ts) {\n        const { affiliatedMax, min } = this.resolvedOptions();\n        const info = resolveTsParts_1.default(ts);\n        const clone = new Date(toNum(ts));\n        if (!affiliatedMax)\n            return;\n        const year = ts.getFullYear();\n        const month = ts.getMonth();\n        const nextMax = affiliatedMax(info);\n        for (let i = value; i >= min && i <= nextMax;) {\n            const { weekday } = resolveTsParts_1.default(clone);\n            if (this.matchToken(weekday, info)) {\n                return i;\n            }\n            i++;\n            clone.setDate(i);\n        }\n        throw new Error(\"Maybe you should carry over the number, then match again\");\n    }\n    formatToParts() {\n        if (!this.formatToPartsCache)\n            this.formatToPartsCache = tokenParser_1.parse(this.pattern, this.unit);\n        return this.formatToPartsCache;\n    }\n}\nexports.default = Token;\n\n\n//# sourceURL=webpack://Cronr/./src/Token.ts?");

/***/ }),

/***/ "./src/Unit.ts":
/*!*********************!*\
  !*** ./src/Unit.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst utils_1 = __webpack_require__(/*! ./utils */ \"./src/utils/index.ts\");\nconst { isLeap } = utils_1.default;\nexports.units = [\n    \"milliSecond\",\n    \"second\",\n    \"minute\",\n    \"hour\",\n    \"day\",\n    \"month\",\n    \"weekday\"\n];\nconst nonLeapLadder = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\nconst leapLadder = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\nlet singletonInstance = Object.create(null);\nconst unitBase = 1000;\nclass Unit {\n    constructor(opts) {\n        const { unit, value, step, max, min, order, setCallee, affiliatedMax } = opts;\n        this.unit = unit;\n        this.value = value;\n        this.max = max;\n        this.min = min;\n        this.order = order;\n        this.step = step;\n        this.setCallee = setCallee;\n        this.affiliatedMax = affiliatedMax;\n    }\n    static instance(unit) {\n        return Unit.create(unit);\n    }\n    static create(unit) {\n        return Unit.getInstance(unit);\n    }\n    static getDayMax({ month, year }) {\n        return isLeap(year) ? leapLadder[month] : nonLeapLadder[month];\n    }\n    static getInstance(unit) {\n        if (!singletonInstance[unit]) {\n            const defaultProps = {\n                unit,\n                order: exports.units.indexOf(unit) + 1\n            };\n            let props = undefined;\n            switch (unit) {\n                case \"milliSecond\":\n                    props = {\n                        min: 0,\n                        max: 999,\n                        step: 1,\n                        value: 1,\n                        setCallee: \"setMilliseconds\"\n                    };\n                    break;\n                case \"second\":\n                    props = {\n                        min: 0,\n                        max: 59,\n                        step: 1 * unitBase,\n                        value: 1 * unitBase,\n                        setCallee: \"setSeconds\"\n                    };\n                    break;\n                case \"minute\":\n                    props = {\n                        min: 0,\n                        max: 59,\n                        step: 60 * unitBase,\n                        value: 60 * unitBase,\n                        setCallee: \"setMinutes\"\n                    };\n                    break;\n                case \"hour\":\n                    props = {\n                        min: 0,\n                        max: 23,\n                        step: 60 * 60 * unitBase,\n                        value: 60 * 60 * unitBase,\n                        setCallee: \"setHours\"\n                    };\n                    break;\n                case \"day\":\n                    props = {\n                        min: 1,\n                        max: Unit.getDayMax,\n                        step: 24 * 3600 * unitBase,\n                        value: 24 * 3600 * unitBase,\n                        setCallee: \"setDate\"\n                    };\n                    break;\n                case \"weekday\":\n                    props = {\n                        min: 1,\n                        max: 7,\n                        affiliatedMax: Unit.getDayMax,\n                        step: 24 * 3600 * unitBase,\n                        value: undefined,\n                        setCallee: \"setDate\"\n                    };\n                    break;\n                case \"month\":\n                    props = {\n                        min: 0,\n                        max: 11,\n                        step: 24 * 3600 * unitBase,\n                        value: undefined,\n                        setCallee: \"setMonth\"\n                    };\n                    break;\n            }\n            singletonInstance[unit] = new Unit(Object.assign({}, props, defaultProps));\n            // } as IUnit);\n        }\n        return singletonInstance[unit];\n    }\n}\nexports.default = Unit;\n\n\n//# sourceURL=webpack://Cronr/./src/Unit.ts?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst Cronr_1 = __webpack_require__(/*! ./Cronr */ \"./src/Cronr.ts\");\nexports.default = Cronr_1.default;\n\n\n//# sourceURL=webpack://Cronr/./src/index.ts?");

/***/ }),

/***/ "./src/tokenParser.ts":
/*!****************************!*\
  !*** ./src/tokenParser.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst tokenTypes_1 = __webpack_require__(/*! ./tokenTypes */ \"./src/tokenTypes.ts\");\nconst Unit_1 = __webpack_require__(/*! ./Unit */ \"./src/Unit.ts\");\nconst isString = (str) => typeof str === \"string\";\nconst isNumber = (obj) => typeof obj === \"number\";\nconst weekdayToNumber = (str) => weekdays.indexOf(str);\nconst monthToNumber = (str) => monthes.indexOf(str);\nconst toInt = (int) => parseInt(int);\nconst capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1, 3);\nconst capitalizeAndSlice = (str) => str.replace(/[a-zA-Z]+/g, capitalizeFirst);\nconst minusOneIfNumber = (str) => str.replace(/[0-9]+/g, (str) => {\n    const number = parseInt(str);\n    return `${number - 1}`;\n});\n// weekday is count from 1, 7 means sunday.\nconst weekdays = [, \"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\", \"Sat\", \"Sun\"];\nconst monthes = [\n    \"Jan\",\n    \"Feb\",\n    \"Mar\",\n    \"Apr\",\n    \"May\",\n    \"Jun\",\n    \"Jul\",\n    \"Aug\",\n    \"Sep\",\n    \"Oct\",\n    \"Nov\",\n    \"Dec\"\n];\nfunction combinePatterns(patterns) {\n    return (str) => {\n        for (let pattern of patterns) {\n            const match = pattern.test(str);\n            if (match)\n                return extractors[pattern.source](str);\n        }\n        throw new Error(`no match patterns`);\n    };\n}\nconst conbineWithProceed = (processors) => (arr) => processors.reduce((prev, cur) => cur(prev), arr);\nconst preProcess = Object.create(null);\npreProcess.month = conbineWithProceed([capitalizeAndSlice, minusOneIfNumber]);\npreProcess.weekday = conbineWithProceed([capitalizeAndSlice]);\nconst twoDigital = /^(\\d{1,2})$/;\nconst threeDigital = /^(\\d{1,2})$/;\nconst numberRange = /^(\\d+)-(\\d+)$/;\nconst asterisk = /^(\\*)(?:\\/([0-9]*))?$/;\nconst oneWithSlash = /^(\\d{1,2})\\/([0-9]*)$/;\nconst twoNumberWithSlash = /^(\\d+)-(\\d+)\\/([0-9]*)$/;\nconst weekday = RegExp(`^(${weekdays.join(\"|\")})(?:-(${weekdays.join(\"|\")}))?$`);\nconst month = RegExp(`^(${monthes.join(\"|\")})(?:-(${monthes.join(\"|\")}))?$`);\nconst patterns = Object.create(null);\npatterns.milliSecond = combinePatterns([\n    threeDigital,\n    numberRange,\n    asterisk,\n    twoNumberWithSlash\n]);\npatterns.second = combinePatterns([\n    twoDigital,\n    numberRange,\n    asterisk,\n    twoNumberWithSlash\n]);\npatterns.minute = combinePatterns([\n    twoDigital,\n    numberRange,\n    asterisk,\n    twoNumberWithSlash\n]);\npatterns.hour = combinePatterns([\n    twoDigital,\n    numberRange,\n    asterisk,\n    twoNumberWithSlash\n]);\npatterns.day = combinePatterns([\n    twoDigital,\n    numberRange,\n    asterisk,\n    twoNumberWithSlash\n]);\npatterns.month = combinePatterns([\n    twoDigital,\n    numberRange,\n    asterisk,\n    twoNumberWithSlash,\n    month\n]);\npatterns.weekday = combinePatterns([\n    twoDigital,\n    numberRange,\n    asterisk,\n    twoNumberWithSlash,\n    weekday\n]);\nconst extractors = Object.create(null);\nconst regToKey = (reg) => reg.source;\nextractors[regToKey(twoDigital)] = (str) => {\n    const result = twoDigital.exec(str);\n    if (result) {\n        const [, value] = result;\n        return {\n            type: tokenTypes_1.LITERAL,\n            value: toInt(value)\n        };\n    }\n    return null;\n};\nextractors[regToKey(threeDigital)] = (str) => {\n    const result = threeDigital.exec(str);\n    if (result) {\n        const [, value] = result;\n        return {\n            type: tokenTypes_1.LITERAL,\n            value: toInt(value)\n        };\n    }\n    return null;\n};\nextractors[regToKey(numberRange)] = (str) => {\n    const result = numberRange.exec(str);\n    if (result) {\n        const [, from, to] = result;\n        return {\n            type: tokenTypes_1.RANGE,\n            value: {\n                from: toInt(from),\n                to: toInt(to)\n            }\n        };\n    }\n    return null;\n};\nextractors[regToKey(asterisk)] = (str) => {\n    const result = asterisk.exec(str);\n    if (result) {\n        const [, , value] = result;\n        if (value)\n            return {\n                type: tokenTypes_1.EVERY,\n                value: toInt(value)\n            };\n        return {\n            type: tokenTypes_1.EVERY,\n            value: 1\n        };\n    }\n};\nextractors[regToKey(oneWithSlash)] = (str) => {\n    const result = oneWithSlash.exec(str);\n    if (result) {\n        const [, from, value] = result;\n        return [\n            { type: tokenTypes_1.EVERY, value: toInt(value) },\n            {\n                type: tokenTypes_1.RANGE,\n                value: {\n                    from: toInt(from)\n                }\n            }\n        ];\n    }\n};\nextractors[regToKey(twoNumberWithSlash)] = (str) => {\n    const result = twoNumberWithSlash.exec(str);\n    if (result) {\n        const [, from, to, value] = result;\n        return [\n            { type: tokenTypes_1.EVERY, value: toInt(value) },\n            {\n                type: tokenTypes_1.RANGE,\n                value: {\n                    from: toInt(from),\n                    to: toInt(to)\n                }\n            }\n        ];\n    }\n    return [];\n};\nextractors[regToKey(weekday)] = (str) => {\n    const nextStr = capitalizeAndSlice(str);\n    const result = weekday.exec(nextStr);\n    if (result) {\n        const [, from, to] = result;\n        if (to)\n            return {\n                type: tokenTypes_1.RANGE,\n                value: {\n                    from: weekdayToNumber(from),\n                    to: weekdayToNumber(to)\n                }\n            };\n        return {\n            type: tokenTypes_1.LITERAL,\n            value: weekdayToNumber(from)\n        };\n    }\n};\nextractors[regToKey(month)] = (str) => {\n    const nextStr = capitalizeAndSlice(str);\n    const result = month.exec(nextStr);\n    if (result) {\n        const [, from, to] = result;\n        if (to)\n            return {\n                type: tokenTypes_1.RANGE,\n                value: {\n                    from: monthToNumber(from),\n                    to: monthToNumber(to)\n                }\n            };\n        return {\n            type: tokenTypes_1.LITERAL,\n            value: monthToNumber(from)\n        };\n    }\n};\nconst normalizeValue = (max, min, value) => {\n    if (value > max)\n        return max;\n    if (value < min)\n        return min;\n    return value;\n};\nconst normalizeRangeValue = (max, min, value) => {\n    const { from, to } = value;\n    const nextFrom = normalizeValue(max, min, from);\n    const nextTo = normalizeValue(max, min, to);\n    return {\n        from: nextFrom,\n        to: nextTo\n    };\n};\nconst runValueRangeConstraint = (unit) => {\n    return (actions) => {\n        const instance = Unit_1.default.getInstance(unit);\n        const { max, min } = instance;\n        if (isNumber(max) && isNumber(min)) {\n            return actions.map((action) => {\n                switch (action.type) {\n                    case tokenTypes_1.LITERAL:\n                        return Object.assign({}, action, { value: normalizeValue(max, min, action.value) });\n                    case tokenTypes_1.RANGE:\n                        return Object.assign({}, action, { value: normalizeRangeValue(max, min, action.value) });\n                    case tokenTypes_1.EVERY:\n                        return Object.assign({}, action);\n                }\n            });\n        }\n        return actions;\n    };\n};\nconst normalizeWeekdayValue = (actions) => {\n    return actions.map(action => {\n        switch (action.type) {\n            case tokenTypes_1.LITERAL:\n                const literalValue = action.value;\n                return Object.assign({}, action, { value: literalValue === 0 ? 7 : literalValue });\n            case tokenTypes_1.RANGE:\n                const rangeValue = action.value;\n                if (rangeValue.from === 0 && rangeValue.to === 6) {\n                    return Object.assign({}, action, { value: { from: 1, to: 7 } });\n                }\n                return Object.assign({}, action);\n            case tokenTypes_1.EVERY:\n                return Object.assign({}, action);\n        }\n    });\n};\nconst postProcess = Object.create(null);\npostProcess.milliSecond = conbineWithProceed([\n    runValueRangeConstraint(\"milliSecond\")\n]);\npostProcess.second = conbineWithProceed([runValueRangeConstraint(\"second\")]);\npostProcess.minute = conbineWithProceed([runValueRangeConstraint(\"minute\")]);\npostProcess.hour = conbineWithProceed([runValueRangeConstraint(\"hour\")]);\npostProcess.month = conbineWithProceed([runValueRangeConstraint(\"month\")]);\n// normalizeWeekdayValue` should run first. It should process origin value with `0-6`\npostProcess.weekday = conbineWithProceed([\n    normalizeWeekdayValue,\n    runValueRangeConstraint(\"weekday\")\n]);\nfunction parse(pattern, unit) {\n    const arr = pattern.split(\",\");\n    return arr.reduce((mergedValue, cur) => {\n        const pattern = patterns[unit];\n        let nextCur = cur;\n        if (preProcess[unit]) {\n            nextCur = preProcess[unit](cur);\n        }\n        let result = pattern(nextCur);\n        if (postProcess[unit]) {\n            result = postProcess[unit]([].concat(result));\n        }\n        return mergedValue.concat(result);\n    }, []);\n}\nexports.parse = parse;\n\n\n//# sourceURL=webpack://Cronr/./src/tokenParser.ts?");

/***/ }),

/***/ "./src/tokenTypes.ts":
/*!***************************!*\
  !*** ./src/tokenTypes.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nexports.LITERAL = \"literal\";\nexports.RANGE = \"range\";\nexports.EVERY = \"every\";\n\n\n//# sourceURL=webpack://Cronr/./src/tokenTypes.ts?");

/***/ }),

/***/ "./src/utils/index.ts":
/*!****************************!*\
  !*** ./src/utils/index.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst min_1 = __webpack_require__(/*! ./min */ \"./src/utils/min.ts\");\nconst isLeap_1 = __webpack_require__(/*! ./isLeap */ \"./src/utils/isLeap.ts\");\nconst sortByValue_1 = __webpack_require__(/*! ./sortByValue */ \"./src/utils/sortByValue.ts\");\nconst toNum_1 = __webpack_require__(/*! ./toNum */ \"./src/utils/toNum.ts\");\nconst resolveTsParts_1 = __webpack_require__(/*! ./resolveTsParts */ \"./src/utils/resolveTsParts.ts\");\nexports.default = {\n    min: min_1.default,\n    toNum: toNum_1.default,\n    isLeap: isLeap_1.default,\n    sortByValue: sortByValue_1.default,\n    resolveTsParts: resolveTsParts_1.default\n};\n\n\n//# sourceURL=webpack://Cronr/./src/utils/index.ts?");

/***/ }),

/***/ "./src/utils/isLeap.ts":
/*!*****************************!*\
  !*** ./src/utils/isLeap.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nexports.default = (year) => !!(year % 4) && !(year % 100) && !(year % 400);\n\n\n//# sourceURL=webpack://Cronr/./src/utils/isLeap.ts?");

/***/ }),

/***/ "./src/utils/min.ts":
/*!**************************!*\
  !*** ./src/utils/min.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst min = (arr) => {\n    return arr.reduce((prev, cur) => {\n        if (cur)\n            return typeof prev !== 'undefined' ? Math.min(prev, cur) : cur;\n        return prev;\n    });\n};\nexports.default = min;\n\n\n//# sourceURL=webpack://Cronr/./src/utils/min.ts?");

/***/ }),

/***/ "./src/utils/resolveTsParts.ts":
/*!*************************************!*\
  !*** ./src/utils/resolveTsParts.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nexports.default = (ts) => {\n    return {\n        milliSecond: ts.getMilliseconds(),\n        second: ts.getSeconds(),\n        minute: ts.getMinutes(),\n        hour: ts.getHours(),\n        day: ts.getDate(),\n        month: ts.getMonth(),\n        // `getDay` will return 0 if sunday, so there is a need to update to\n        // `7` first.\n        weekday: ts.getDay() === 0 ? 7 : ts.getDay()\n    };\n};\n\n\n//# sourceURL=webpack://Cronr/./src/utils/resolveTsParts.ts?");

/***/ }),

/***/ "./src/utils/sortByValue.ts":
/*!**********************************!*\
  !*** ./src/utils/sortByValue.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst sortByValue = (a, b) => {\n    const { value: va } = a;\n    const { value: vb } = b;\n    return va - vb;\n};\nexports.default = sortByValue;\n\n\n//# sourceURL=webpack://Cronr/./src/utils/sortByValue.ts?");

/***/ }),

/***/ "./src/utils/toNum.ts":
/*!****************************!*\
  !*** ./src/utils/toNum.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst toNum = (date) => date.valueOf();\nexports.default = toNum;\n\n\n//# sourceURL=webpack://Cronr/./src/utils/toNum.ts?");

/***/ })

/******/ });
});