const inside = (point, polygon) => {
    function isInside(pointCoord, polygonCoord) {
        const x = pointCoord[0];
        const y = pointCoord[1];
        const length = polygonCoord.length;
        let result = false;

        for (let i = 0, j = length - 1; i < length; i++) {
            const xi = polygonCoord[i][0];
            const yi = polygonCoord[i][1];
            const xj = polygonCoord[j][0];
            const yj = polygonCoord[j][1];
            const intersect = (
                (((yi <= y) && (y < yj)) || ((yj <= y) && (y < yi))) &&
                (x > (xj - xi) * (y - yi) / (yj - yi) + xi)
            );

            if (intersect) result = !result;
            j = i;
        }

        return result;
    }

    const pointCoord = point.coordinates;
    const polygonsCoord = polygon.type === 'Polygon' ?
        [polygon.coordinates] : polygon.coordinates;

    let result = false;

    for (let i = 0; i < polygonsCoord.length && !result; i++) {
        const polygonCoord = polygonsCoord[i][0];

        result = isInside(pointCoord, polygonCoord);

        if (result) {
            for (let k = 1; i < polygonCoord.length && !result; i++) {
                const holeCoord = polygonsCoord[i][k];

                result = !isInside(pointCoord, holeCoord);
            }
        }
    }

    return result;
};

module.exports = inside;
