<template>
  <q-list :class="{'flex justify-evenly full-width': $q.screen.lt.md}">
    <div v-if="annotationStore.mode !== 'action'">
      <q-item dense>
        <q-item-section class="text-center">
          Copy
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-btn-group
              spread
              flat
          >
            <q-btn
                outline
                icon="arrow_back"
                @click="handleCopyLeft"
            >
              <q-tooltip>copy from right to left</q-tooltip>
            </q-btn>
            <q-btn
                outline
                icon="arrow_forward"
                @click="handleCopyRight"
            >
              <q-tooltip>copy from left to right</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-btn-group
              spread
              flat
          >
            <q-btn
                outline
                icon="first_page"
                @click="handleReplaceLeft"
            >
              <q-tooltip>replace left with right</q-tooltip>
            </q-btn>
            <q-btn
                outline
                icon="last_page"
                @click="handleReplaceRight"
            >
              <q-tooltip>replace right with left</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-btn-group
              spread
              flat
          >
            <q-btn
                outline
                icon="double_arrow"
                label="fill"
                @click="handleInterpolate"
            >
              <q-tooltip>interpolate between with same instance id</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-item-section>
      </q-item>
    </div>
    <div>
      <q-item dense>
        <q-item-section class="text-center">Mode</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-select
              v-model="annotationStore.mode"
              outlined
              stack-label
              dense
              options-dense
              :options="modeOptions"
              :readonly="modeOptions.length === 1"
          ></q-select>
        </q-item-section>
      </q-item>
      <q-item v-if="annotationStore.mode === 'skeleton'">
        <q-item-section>
          <q-select
              v-model="annotationStore.skeletonTypeId"
              outlined
              stack-label
              dense
              options-dense
              map-options
              emit-value
              :options="skeletonTypeOptions"
          ></q-select>
        </q-item-section>
      </q-item>
      <q-item v-if="$q.platform.has.touch && annotationStore.mode !== 'action'">
        <q-item-section>
          <q-toggle
              v-model="delMode"
              label="Delete"
          ></q-toggle>
          <q-toggle
              v-model="copyMode"
              label="Copy"
          ></q-toggle>
          <q-toggle
              v-if="annotationStore.mode === 'region'"
              v-model="addPointMode"
              label="Add Point"
          ></q-toggle>
          <q-toggle
              v-if="annotationStore.mode === 'region'"
              v-model="delPointMode"
              label="Del Point"
          ></q-toggle>
          <q-toggle
              v-if="annotationStore.mode === 'skeleton'"
              v-model="indicatingMode"
              label="Indicate"
          ></q-toggle>
        </q-item-section>
      </q-item>
    </div>
    <div v-if="annotationStore.mode !== 'action'">
      <q-item dense>
        <q-item-section class="text-center">Operation</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-btn
              outline
              label="bulk"
              icon="delete_forever"
              @click="handleBulkClear"
          >
            <q-tooltip>Clear all annotations between left and right frame</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </div>
    <div>
      <q-item dense>
        <q-item-section class="text-center">Options</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-toggle
              v-model="preferenceStore.muted"
              label="Muted"
          />
          <q-toggle
              v-model="preferenceStore.grayscale"
              label="Grayscale"
          />
          <q-toggle
              v-if="!$q.platform.has.touch && annotationStore.mode !== 'action'"
              v-model="preferenceStore.showPopup"
              label="Show Popup"
          />
        </q-item-section>
      </q-item>
    </div>
  </q-list>
</template>

<script setup>
import { computed, watch } from 'vue'
import { ObjectAnnotation, RegionAnnotation, SkeletonAnnotation } from '~/libs/annotationlib.js'
import utils from '~/libs/utils.js'
import { useAnnotationStore } from '~/store/annotation.js'
import { useConfigurationStore } from '~/store/configuration.js'
import { useMainStore } from '~/store/index.js'
import { usePreferenceStore } from '~/store/preference.js'

const mainStore = useMainStore()
const preferenceStore = usePreferenceStore()
const annotationStore = useAnnotationStore()
const configurationStore = useConfigurationStore()

const annotationListMap = computed(() => annotationStore[annotationStore.mode + 'AnnotationListMap'])

const clone = annotationList => {
  return annotationList.map(annotation => annotation.clone())
}

// copy
const handleCopyLeft = () => {
  if (annotationStore.leftCurrentFrame === annotationStore.rightCurrentFrame) {
    utils.notify('Cannot copy from itself.', 'warning')
    return
  }
  if (annotationListMap.value[annotationStore.rightCurrentFrame].length === 0) {
    utils.notify('There is nothing to copy.', 'warning')
    return
  }
  annotationListMap.value[annotationStore.leftCurrentFrame].push(
      ...clone(annotationListMap.value[annotationStore.rightCurrentFrame])
  )
}
const handleCopyRight = () => {
  if (annotationStore.leftCurrentFrame === annotationStore.rightCurrentFrame) {
    utils.notify('Cannot copy from itself.', 'warning')
    return
  }
  if (annotationListMap.value[annotationStore.leftCurrentFrame].length === 0) {
    utils.notify('There is nothing to copy.', 'warning')
    return
  }
  annotationListMap.value[annotationStore.rightCurrentFrame].push(
      ...clone(annotationListMap.value[annotationStore.leftCurrentFrame])
  )
}
const handleReplaceLeft = () => {
  if (annotationStore.leftCurrentFrame === annotationStore.rightCurrentFrame) {
    utils.notify('Cannot replace with itself.', 'warning')
    return
  }
  if (annotationListMap.value[annotationStore.rightCurrentFrame].length === 0) {
    utils.notify('There is nothing to replace.', 'warning')
    return
  }
  if (annotationListMap.value[annotationStore.leftCurrentFrame].length === 0) {
    annotationListMap.value[annotationStore.leftCurrentFrame] = clone(
        annotationListMap.value[annotationStore.rightCurrentFrame]
    )
  } else {
    utils.confirm('Are you sure to replace? This would remove ALL annotations in the LEFT panel!').onOk(() => {
      annotationListMap.value[annotationStore.leftCurrentFrame] = clone(
          annotationListMap.value[annotationStore.rightCurrentFrame]
      )
    })
  }
}
const handleReplaceRight = () => {
  if (annotationStore.leftCurrentFrame === annotationStore.rightCurrentFrame) {
    utils.notify('Cannot replace with itself.', 'warning')
  }
  if (annotationListMap.value[annotationStore.leftCurrentFrame].length === 0) {
    utils.notify('There is nothing to replace.', 'warning')
    return
  }
  if (annotationListMap.value[annotationStore.rightCurrentFrame].length === 0) {
    annotationListMap.value[annotationStore.rightCurrentFrame] = clone(
        annotationListMap.value[annotationStore.leftCurrentFrame]
    )
  } else {
    utils.confirm('Are you sure to replace? This would remove ALL annotations in the RIGHT panel!').onOk(() => {
      annotationListMap.value[annotationStore.rightCurrentFrame] = clone(
          annotationListMap.value[annotationStore.leftCurrentFrame]
      )
    })
  }
}

function cyclePoints(x, y) {
  let d_min = Infinity;
  let i_min = 0;
  let c_direction = null;
  const n = x.length;

  for (let i = 0; i < n; i++) {
    for (let l = 0; l < 2; l++) {
      let d = 0;
      for (let j = 0; j < n; j++) {
        let current_x = x[j];
        let current_y = null;
        let index = (i - j + n) % n; // calculate (i - j) modulo n
        if (l === 0) {
          current_y = y[(i + j) % n];
        } else {
          current_y = y[index];
        }

        let result_x = current_x['x'] - current_y['x'];
        let result_y = current_x['y'] - current_y['y'];

        d += Math.pow((result_x + result_y), 2);
      }

      if (d < d_min) {
        d_min = d;
        i_min = i;
        c_direction = l;
      }
    }
  }

  return [d_min, i_min, c_direction];
}

function temp_linear_inter(x_1, x_T, t, T) {
  let x_t = x_1 + (((x_T - x_1) * (t-1)) / (T - 1))

  return x_t;
}


function findSubsets(array, size) {
  if (size === 0) {
    return [[]];
  }


  const results = [];
  for (let i = 0; i < array.length; i++) {
    const subCombinations = findSubsets(array.slice(i + 1), size - 1);
    for (const subCombination of subCombinations) {
      results.push([array[i], ...subCombination]);
    }
  }

  return results;
}

// A = Polygon A
function minimumSubset(A, subsets) {
  let d_min = Infinity;
  let i_min = 0;
  const n = A.length;

  for(let currentSubset = 0; currentSubset < subsets.length; currentSubset++) {
    let y = subsets[currentSubset];
    for (let i = 0; i < n; i++) {
      for (let l = 0; l < 2; l++) {
        let d = 0;
        for (let j = 0; j < n; j++) {
          let current_x = A[j];
          let current_y = null;
          let index = (i - j + n) % n; // calculate (i - j) modulo n
          if (l === 0) {
            current_y = y[(i + j) % n];
          } else {
            current_y = y[index];
          }

          let result_x = current_x['x'] - current_y['x'];
          let result_y = current_x['y'] - current_y['y'];

          d += Math.pow((result_x + result_y), 2);
        }

        if (d < d_min) {
          d_min = d;
          i_min = i;
        }
      }
    }
  }

  return [i_min, d_min];
}



function convertPointList(pointList) {
  console.log("Create point list called");
  let newPointList = []

  for (let i = 0; i < pointList.length; i++) {
    newPointList.push([pointList[i]['x'], pointList[i]['y']])
  }
  
  return newPointList
}

function removeCorrespondence(A, B){
  let result = [];
  // console.log("In removeCorrespondence");
  // console.log(A);
  for (let coordinate_A of A){ 
    let corresponding = false; 
      for(let coordinate_B of B) { 
          if(coordinate_A[0] == coordinate_B[0] && coordinate_A[1] == coordinate_B[1]) {
            corresponding = true;
          }
      }
      if(!corresponding) {
        result.push(coordinate_A)
      }
  } 
  
  return result;
}

function createSegments(pointList) {
  let segments = [];
  let i = 0;
  while (i < pointList.length) {
    if(pointList[i + 1] == undefined) {
      segments.push([pointList[i], pointList[0]]);
    } else {
      segments.push([pointList[i], pointList[i+1]]);
    }
    i += 1;
  }
  return segments;
}

function getEquationCoeffs(segments_A) {
    let equations_coeffs = []; // Ax + By + C = 0 | A = index 0, B = index 1, C = index 2

    console.log(segments_A.length)
    for (let i = 0; i < segments_A.length; i++) {
        if (segments_A[i][0][0] == segments_A[i][1][0]){
            equations_coeffs.push([1, 0, -segments_A[i][0][0]])
        }
        else if (segments_A[i][0][1] == segments_A[i][1][1]) {
            equations_coeffs.push([0, 1, -segments_A[i][0][1]])
        }
        else {
            let slope = (segments_A[i][1][1] - segments_A[i][0][1]) / (segments_A[i][1][0] - segments_A[i][0][0])
            let y_intercept = segments_A[i][0][1] - slope * segments_A[i][0][0]
          
            // Assuming the coefficient for y will always be one, since we just rearranging y=mx+c
            // Multiplying by -1 for rearrangement purposes
            equations_coeffs.push([(slope * -1), 1, (y_intercept * -1)]); 
        }
  }
      return equations_coeffs
}


function findDistanceToLine(x, y, equationList){
    let distanceList = {}
    for (let i = 0; i < equationList.length; i++) {
        let coeffs = equationList[i];
        let [A, B, C] = coeffs
        let distance = Math.abs((A * x + B * y + C)) / (Math.sqrt(A**2 + B**2))
        distanceList[distance] = coeffs
    }
    
    return distanceList
}

// function convertSegmentToPointList(segments_A) {
//   let pointList = []
//   for(let i = 0; i < segments_A.length; i++) {
//       if(pointList.indexOf(segments_A[i][0]) == -1) {
//         pointList.push(segments_A[i][0]);
//         {
//           segments_A[i][0]
//         }
//       }

//       if(pointList.indexOf(segments_A[i][1]) == -1) {
//         pointList.push(segments_A[i][1]);
//       }

//   }

//   return pointList;
// }


function addNewPoint(polygonA, bestSegment, newPoint) {
  let newPolygon = [];
  let polygonPoints = convertPointList(polygonA);
    for (let i = 0; i < polygonPoints.length; i++) {
      newPolygon.push(polygonA[i]);
      if((polygonPoints[i][0] == bestSegment[0][0]) && (polygonPoints[i][1] == bestSegment[0][1])) {
          newPolygon.push({'x': newPoint[0], 'y': newPoint[1]})
      }
      
    }
    return newPolygon;
}

function getIndexOf(array, pattern) {
    var index = -1;
    array.some(function (a, i) {
        if (a.length !== pattern.length) {
            return false;
        }
        if (a.every(function (b, j) { return b === pattern[j]; })) {
            index = i;
            return true;
        }
    });
    return index;
}

function getPointsPerFrame(polygonA, polygonB, numberOfFrames) {
  let n = polygonB.length;
  let m = polygonA.length;

  let pointAmount = (n - m) / numberOfFrames;

  let pointPerFrame = [];

  for (var i = 1; i <= numberOfFrames; i++) {
    pointPerFrame.push(Math.round((i * pointAmount) + m));
  }

  return pointPerFrame;
}


function spatialInterpolate(leftAnnotation, rightAnnotation) {
          let polygon_A = leftAnnotation.pointList;
        let polygon_B = rightAnnotation.pointList;

        console.log("polygon_A");
        console.log(polygon_A);
        
        console.log("About to call convert point list");
        let segments_A = createSegments(convertPointList(polygon_A));
        // let segments_B = createSegments(convertPointList(polygon_B));

        console.log("Segments_A");
        console.log(segments_A);
        
        const subsets = findSubsets(polygon_B, polygon_A.length)

        // console.log("Subsets: ");
        // console.log(subsets);

        const subset_length = subsets.length;

        // console.log("Subset length: ");
        // console.log(subset_length);

        let [s_min, distance] = minimumSubset(polygon_A, subsets);

        // console.log("s_min, distance");
        // console.log(s_min + " " + distance);

        let b_corr = convertPointList(subsets[s_min]);

        let polygon_A_conv = convertPointList(polygon_A)
        let polygon_B_conv = convertPointList(polygon_B)

        // console.log(polygon_A_conv);
        // Get all the elements in polygon B that do not correspond with A.
        let S = removeCorrespondence(polygon_B_conv, b_corr);

        let smallestValues = {}
        let equations_coeffs_list = [];
        for(let i = 0; i < S.length; i++) {
          let [x,y] = S[i];
          let equations_coeffs = getEquationCoeffs(segments_A);
          let segmentDistances = findDistanceToLine(x, y, equations_coeffs);
          let smallestKey = Math.min(...Object.keys(segmentDistances));
          smallestValues[smallestKey] = segmentDistances[smallestKey];

          // console.log("Equation coeff: ");
          // console.log(equations_coeffs);
          equations_coeffs_list.push(...equations_coeffs);

        }


        let greatest_key = Math.max(...Object.keys(smallestValues));
        let greatest_segment = smallestValues[greatest_key];
        



        let greatest_segment_index = getIndexOf(equations_coeffs_list, greatest_segment);
        let bestSegment = segments_A[greatest_segment_index];

        // console.log(equations_coeffs_list);
        // console.log("Best Segment");
        // console.log(bestSegment);

        let x1 = bestSegment[0][0]
        let x2 = bestSegment[1][0]

        let y1 = bestSegment[0][1]
        let y2 = bestSegment[1][1]

        let midpoint_x = (x1 + x2)/2 
        let midpoint_y = (y1 + y2)/2

        let newPoint = [midpoint_x, midpoint_y]

        // console.log("New Point: ");
        // console.log(newPoint);
        // Add the new segments connecting the midpoint
        segments_A = segments_A.concat([
          [bestSegment[0], newPoint],
          [bestSegment[1], newPoint]
        ]);


        let newPointList = addNewPoint(polygon_A, bestSegment, newPoint);

        return newPointList
}
 
const handleInterpolate = () => {
  // console.log("In handle interpolate");
  const leftAnnotationList = annotationListMap.value[annotationStore.leftCurrentFrame]
  const rightAnnotationList = annotationListMap.value[annotationStore.rightCurrentFrame]

  // console.log("Right Interpolating: ");
  const interpolateList = [];
  for (const leftAnnotation of leftAnnotationList) {
    let cnt = 0
    for (const rightAnnotation of rightAnnotationList) {
      if (
          rightAnnotation.instance !== null &&
          leftAnnotation.instance !== null &&
          rightAnnotation.instance === leftAnnotation.instance &&
          ((annotationStore.mode === 'object' || annotationStore.mode === 'region') && rightAnnotation.labelId ===
              leftAnnotation.labelId) ||
          (annotationStore.mode === 'skeleton' && rightAnnotation.typeId === leftAnnotation.typeId)
      ) {
        // same number of points only
        if (annotationStore.mode === 'region') {
          // if (leftAnnotation.pointList.length !== rightAnnotation.pointList.length) {
          //   utils.notify('Interpolating between different #points regions is not supported!', 'warning')
          //   continue
          // }
        }
        cnt += 1
        if (cnt > 1) {
          utils.notify('Can not interpolate from one to many.', 'warning')
          continue
        }

        /**
         * Temporal Interpolation
         */
        // let [d_min, i_min, direction] = cyclePoints(leftAnnotation.pointList,rightAnnotation.pointList)


        // if (direction === 0) {
        //   rightAnnotation.pointList = [...rightAnnotation.pointList.slice(i_min), ...rightAnnotation.pointList.slice(0, i_min)];
        //   console.log(rightAnnotation.pointList);
        // } else {
        //   const index_item = rightAnnotation.pointList.splice(i_min, 1)[0];
          
        //   if (i_min !== 1) {
        //     rightAnnotation.pointList.reverse();
        //   }
          
        //   rightAnnotation.pointList.unshift(index_item);
        //   console.log(rightAnnotation.pointList);
        // }



        // console.log("Segments_A (non-modified): " + segments_A)

        // console.log(segments_A.splice(equations_coeffs_list.indexOf(greatest_segment), 1));

        // console.log("Segments_A (modified): " + segments_A)


        // console.log("New PointList: ");
        // console.log(convertSegmentToPointList(segments_A));

        // console.log("S: ");
        // console.log(S);

        // console.log("Segments of A: ");
        // console.log(segments_A);

      // const nFrames = annotationStore.rightCurrentFrame - annotationStore.leftCurrentFrame - 1
      // const pointsPerFrame = getPointsPerFrame(leftAnnotation.pointList, rightAnnotation.pointList, nFrames);

      // // console.log("Current Frame: ");
      // // console.log(pointsPerFrame);
      // // console.log(leftAnnotation.pointList);
      // if (pointsPerFrame[cnt] != leftAnnotation.pointList.length) {
      //   console.log("Adding Point");
      //   leftAnnotation.pointList = spatialInterpolate(leftAnnotation, rightAnnotation);
      // } else {
      //   leftAnnotation.pointList = leftAnnotation.pointList;
      // }

      


        console.log("New right annotation: ");
        console.log(rightAnnotation);
        interpolateList.push({
          leftAnnotation,
          rightAnnotation
        })
      }
    }
  }
  if (interpolateList.length === 0) {
    utils.notify('There is nothing to interpolate.', 'warning')
    return
  }
  console.log("Interpolate list: ");
  
  for (const interpolate of interpolateList) {
    const leftAnnotation = interpolate.leftAnnotation
    const rightAnnotation = interpolate.rightAnnotation
    let i = 1
    const nFrames = annotationStore.rightCurrentFrame - annotationStore.leftCurrentFrame - 1
    const pointsPerFrame = getPointsPerFrame(leftAnnotation.pointList, rightAnnotation.pointList, nFrames);
    for (let frame = annotationStore.leftCurrentFrame + 1; frame < annotationStore.rightCurrentFrame; frame++) {
      const ratio = i / nFrames
      i += 1
      const originalAnnotationList = annotationListMap.value[frame] || []
      // remove archive interpolations
      for (let k = 0; k < originalAnnotationList.length; k++) {
        if (
            originalAnnotationList[k].instance === leftAnnotation.instance &&
            (
                (
                    (annotationStore.mode === 'object' || annotationStore.mode === 'region') &&
                    originalAnnotationList[k].labelId === leftAnnotation.labelId
                )
                ||
                (
                    annotationStore.mode === 'skeleton' &&
                    originalAnnotationList[k].typeId === leftAnnotation.typeId
                )
            )
        ) {
          originalAnnotationList.splice(k, 1)
        }
      }
      // interpolate from left to right
      if (annotationStore.mode === 'object') {
        originalAnnotationList.push(new ObjectAnnotation(
            leftAnnotation.x * (1 - ratio) + rightAnnotation.x * ratio,
            leftAnnotation.y * (1 - ratio) + rightAnnotation.y * ratio,
            leftAnnotation.width * (1 - ratio) + rightAnnotation.width * ratio,
            leftAnnotation.height * (1 - ratio) + rightAnnotation.height * ratio,
            leftAnnotation.labelId,
            leftAnnotation.color,
            leftAnnotation.instance,
            leftAnnotation.score
        ))
      } else if (annotationStore.mode === 'region') {
        let newPointList = []
        // for (let k = 0; k < leftAnnotation.pointList.length; k++) {
        //   const leftPoint = leftAnnotation.pointList[k]
        //   const rightPoint = rightAnnotation.pointList[k]
        //   newPointList.push({
        //     x: leftPoint.x * (1 - ratio) + rightPoint.x * ratio,
        //     y: leftPoint.y * (1 - ratio) + rightPoint.y * ratio
        //   })
        // }

        console.log("left point list: ");
        console.log(leftAnnotation.pointList);
        // console.log("right point list: ");
        // console.log(rightAnnotation.pointList);
        // console.log("Right current frame: "); 
        // console.log(annotationStore.rightCurrentFrame);

        /** 
         * TEMPORAL INTERPOLATION
         */
        // for (let k = 0; k < leftAnnotation.pointList.length; k++) {
        //   const leftPoint = leftAnnotation.pointList[k]
        //   const rightPoint = rightAnnotation.pointList[k]

        //   console.log("leftPoint");
        //   console.log(leftPoint);
        //   console.log("rightPoint");
        //   console.log(rightPoint);
        //   console.log(frame);
        //   console.log(annotationStore.rightCurrentFrame);

        //   const x_interpolated = temp_linear_inter(leftPoint['x'], rightPoint['x'], 
        //   i, nFrames);

        //   const y_interpolated = temp_linear_inter(leftPoint['y'], rightPoint['y'], 
        //   i, nFrames);

        //   console.log("Interpolated frame: ")
        //   console.log(x_interpolated, ", " + y_interpolated)

        //   newPointList.push({
        //     x: x_interpolated,
        //     y: y_interpolated
        //   })
        // }

        /**
         * Spatial Interpolation
         */
        // console.log("Current Frame: ");
        // console.log(pointsPerFrame);
        // console.log(leftAnnotation.pointList);
        if (pointsPerFrame[frame] != leftAnnotation.pointList.length) {
          console.log("Adding Point");
          leftAnnotation.pointList = spatialInterpolate(leftAnnotation, rightAnnotation);
        } else {
          leftAnnotation.pointList = leftAnnotation.pointList;
        }



        originalAnnotationList.push(new RegionAnnotation(
            newPointList,
            leftAnnotation.labelId,
            leftAnnotation.color,
            leftAnnotation.instance,
            leftAnnotation.score
        ))
      } else if (annotationStore.mode === 'skeleton') {
        const newPointList = []
        for (let k = 0; k < leftAnnotation.pointList.length; k++) {
          const leftPoint = leftAnnotation.pointList[k]
          const rightPoint = rightAnnotation.pointList[k]
          newPointList.push({
            id: leftPoint.id,
            name: leftPoint.name,
            x: leftPoint.x * (1 - ratio) + rightPoint.x * ratio,
            y: leftPoint.y * (1 - ratio) + rightPoint.y * ratio
          })
        }
        const newSkeletonAnnotation = new SkeletonAnnotation(
            leftAnnotation.centerX * (1 - ratio) + rightAnnotation.centerX * ratio,
            leftAnnotation.centerY * (1 - ratio) + rightAnnotation.centerY * ratio,
            leftAnnotation.typeId,
            leftAnnotation.color,
            leftAnnotation.instance,
            leftAnnotation.score
        )
        newSkeletonAnnotation.ratio = leftAnnotation.ratio * (1 - ratio) + rightAnnotation.ratio * ratio
        newSkeletonAnnotation.pointList = newPointList
        originalAnnotationList.push(newSkeletonAnnotation)
      }
      annotationListMap.value[frame] = originalAnnotationList
    }
  }
  // console.log(interpolateList);
  // console.log(annotationListMap);
  utils.notify('Interpolate successfully.', 'positive')
}

// mode
const modeOptions = computed(() => {
  const ret = []
  if (preferenceStore.objects) ret.push('object')
  if (preferenceStore.regions) ret.push('region')
  if (preferenceStore.skeletons) ret.push('skeleton')
  return ret
})
const skeletonTypeOptions = computed(
    () => configurationStore.skeletonTypeData.map(type => {
      return {
        label: type.name,
        value: type.id
      }
    })
)

/// mode for mobile
const delMode = computed({
  get: () => annotationStore.delMode,
  set: newValue => {
    if (newValue) {
      annotationStore.delMode = true
      annotationStore.copyMode = false
      annotationStore.addPointMode = false
      annotationStore.delPointMode = false
      annotationStore.indicatingMode = false
    } else {
      annotationStore.delMode = false
    }
  }
})
const copyMode = computed({
  get: () => annotationStore.copyMode,
  set: newValue => {
    if (newValue) {
      annotationStore.delMode = false
      annotationStore.copyMode = true
      annotationStore.addPointMode = false
      annotationStore.delPointMode = false
      annotationStore.indicatingMode = false
    } else {
      annotationStore.copyMode = false
    }
  }
})
const addPointMode = computed({
  get: () => annotationStore.addPointMode,
  set: newValue => {
    if (newValue) {
      annotationStore.delMode = false
      annotationStore.copyMode = false
      annotationStore.addPointMode = true
      annotationStore.delPointMode = false
      annotationStore.indicatingMode = false
    } else {
      annotationStore.addPointMode = false
    }
  }
})
const delPointMode = computed({
  get: () => annotationStore.delPointMode,
  set: newValue => {
    if (newValue) {
      annotationStore.delMode = false
      annotationStore.copyMode = false
      annotationStore.addPointMode = false
      annotationStore.delPointMode = true
      annotationStore.indicatingMode = false
    } else {
      annotationStore.delPointMode = false
    }
  }
})
const indicatingMode = computed({
  get: () => annotationStore.indicatingMode,
  set: newValue => {
    if (newValue) {
      annotationStore.delMode = false
      annotationStore.copyMode = false
      annotationStore.addPointMode = false
      annotationStore.delPointMode = false
      annotationStore.indicatingMode = true
    } else {
      annotationStore.indicatingMode = false
    }
  }
})
watch(() => annotationStore.mode,
    () => {
      annotationStore.delMode = false
      annotationStore.copyMode = false
      annotationStore.addPointMode = false
      annotationStore.delPointMode = false
      annotationStore.indicatingMode = false
    }
)

// operation
const handleBulkClear = () => {
  utils.confirm(
      `Are you sure to REMOVE ALL ${annotationStore.mode} annotations between frame ${annotationStore.leftCurrentFrame} to ${annotationStore.rightCurrentFrame}?`).
      onOk(() => {
        for (let frame = annotationStore.leftCurrentFrame; frame <= annotationStore.rightCurrentFrame; frame += 1) {
          annotationListMap.value[frame] = []
        }
        utils.notify('Bulk clear successful!', 'positive')
      })
}
</script>
