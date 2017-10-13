/*
 * @name Poisson Disc Sampling
 * @frame 710, 400
 * @description Based on https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf
 */

var r = 15, // Minimum distance between samples
    k = 30, // Sample limit before rejection
    n = 2, // Dimension (we can't really draw beyond 3 on this one)
    animationDelaySec = 0.1,
    cellSize2;

function setup() {
  createCanvas(710, 400);
  rectMode(CORNER);
  noLoop();

}

function draw() {
  background(102);
  noFill();
  const samples = calculateSamples();
  drawSamples(samples);
}

function calculateSamples() {
  const cellSize = r / sqrt(n),
        gridWidth = ceil(width / cellSize),
        gridHeight = ceil(height / cellSize),
        grid = Array(gridWidth * gridHeight),
        initialSample = createVector(floor(random(width)), floor(random(height))),
        activeList = [initialSample],
        out = [initialSample];

  const findGridLocFn = function(sample) {
    let i = floor(sample.x / cellSize),
        j = floor(sample.y / cellSize);

    return j * gridWidth + i;
  };

  const isFarFromOthersFn = function(sample) {
    let searchSize = 5,
        sampleLoc = findGridLocFn(sample);

    for (let j = 0; j < searchSize; j++) {
      let y = floor(sample.y / cellSize) + j - 2;
      for (let k = 0; k < searchSize; k++) {
        let x = floor(sample.x / cellSize) + k - 2;

        if (x < 0 || y < 0) {
          continue;
        }

        let i = y * gridWidth + x,
            nearSample = grid[i];

        if (nearSample && nearSample !== sample) {
          let dist = sample.dist(nearSample);
          if(dist <= r) {
            return false;
          }
        }
      }
    }
    return true;
  };

  let initialGridLoc = findGridLocFn(initialSample);
  grid[initialGridLoc] = initialSample;

  let limit = 0;
  while (activeList.length) {
    let i = floor(random(activeList.length));

    let candidate = chooseSample(activeList[i], isFarFromOthersFn);

    if (!candidate) {
      activeList.splice(i, 1);
    } else {
      let loc = findGridLocFn(candidate);
      grid[loc] = candidate;

      activeList.push(candidate);
      out.push(candidate);
      limit++;
    }
  }
  return out;
}

function chooseSample(base, isFarFromOthersFn) {
  let count = 0;
  while (count < k) {
    let angle = random(2 * PI),
        radius = random(r, 2 * r),
        x = base.x + radius * cos(angle),
        y = base.y + radius * sin(angle),
        sample = createVector(x, y);


    if (isWithinBounds(sample) && isFarFromOthersFn(sample)) {
      return sample;
    }
    count++;
  }
  return null;
}

function isWithinBounds(sample) {
  return sample.x >= 0 && sample.x < width && sample.y >= 0 && sample.y < height;
}

function drawGrid(grid, gridWidth, gridHeight) {
  noFill();
  stroke(0, 0, 0);
  for (var f = 0; f < grid.length; f++) {
    let x = f % gridWidth,
        y = (f - x) / gridWidth,
        cellWidth = width/gridWidth,
        cellHeight = height/gridHeight;

    fill(100, 100, 100);
    rect(x * cellWidth, y * cellHeight, cellWidth - 1, cellHeight - 1);
  }
}

function drawSamples(samples) {
  fill(11, 72, 107);

  for (let pt of samples) {
    ellipse(pt.x, pt.y, 7);
  }

}

// helper functions for debugging
function samplePerCell(grid, gridWidth, gridHeight, isRandom) {
  const out = [];
  for (let i = 0; i < grid.length; i++) {
    if (!grid[i]) {
      let cellWidth = width/gridWidth,
          cellHeight = height/gridHeight,
          xMin = i % gridWidth,
          yMin = (i - xMin) / gridWidth;

      if (!isRandom) {
        grid[i] = createVector(cellWidth/2 + xMin * cellWidth, cellHeight/2 + yMin * cellHeight);
      } else {
        let finalX = (random(cellWidth) | 0) + xMin * cellWidth,
            finalY = (random(cellHeight) | 0) + yMin * cellWidth;
        grid[i] = createVector(finalX, finalY);
      }

      out.push(grid[i]);
    }
  }
  return out;
}
