/**
 * Hexagons on the map can be one of these kind
 */
enum HexagonType {
    Land, /* Resource can grow on it */
    Beach, /* Land hexagon slighlty under water. Does not contains resources */
    Water, 
    DeepWater,
    DeeperWater,
}
