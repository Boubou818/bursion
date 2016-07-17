/**
 * Hexagons on the map can be one of these kind
 */
var HexagonType;
(function (HexagonType) {
    HexagonType[HexagonType["Land"] = 0] = "Land";
    HexagonType[HexagonType["Beach"] = 1] = "Beach";
    HexagonType[HexagonType["Water"] = 2] = "Water";
    HexagonType[HexagonType["DeepWater"] = 3] = "DeepWater";
    HexagonType[HexagonType["DeeperWater"] = 4] = "DeeperWater";
})(HexagonType || (HexagonType = {}));
//# sourceMappingURL=HexagonType.js.map