class Calibration {
    constructor(gameState) {
        this.gameState = gameState;
        this.sampleSize = gameState.beatDetection.calibration.sampleSize;
        this.samples = gameState.beatDetection.calibration.samples;
    }

    startCalibration() {
        this.gameState.beatDetection.calibration.isCalibrating = true;
        this.samples = [];
        console.log('Iniciando calibración...');
    }

    addSample(expectedTime, actualTime) {
        if (!this.gameState.beatDetection.calibration.isCalibrating) return;
        
        const offset = actualTime - expectedTime;
        this.samples.push(offset);

        if (this.samples.length >= this.sampleSize) {
            this.finishCalibration();
        }
    }

    finishCalibration() {
        // Calcular el offset promedio, excluyendo valores atípicos
        const sortedSamples = [...this.samples].sort((a, b) => a - b);
        const trimmedSamples = sortedSamples.slice(1, -1); // Remover el valor más alto y más bajo
        const average = trimmedSamples.reduce((a, b) => a + b, 0) / trimmedSamples.length;

        this.gameState.beatDetection.calibration.offsetMs = average;
        this.gameState.beatDetection.calibration.isCalibrating = false;
        this.samples = [];

        console.log(`Calibración completada. Offset: ${average}ms`);
        return average;
    }

    applyOffset(time) {
        return time + this.gameState.beatDetection.calibration.offsetMs;
    }
}
