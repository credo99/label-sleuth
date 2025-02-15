/*
    Copyright (c) 2022 IBM Corp.
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

/**
 * Returns the suffix of a number in its ordinal form
 **/
export const getOrdinalSuffix = (x) => {
  // suffix pattern repeats every 100 numbers
  x %= 100;
  let prefix = "th";
  if (x <= 3 || x >= 21) {
    switch (x % 10) {
      case 1:
        prefix = "st";
        break;
      case 2:
        prefix = "nd";
        break;
      case 3:
        prefix = "rd";
        break;
      default:
        {}
    }
  }
  return prefix;
};
export const getCategoryQueryString = (curCategory) => {
  return curCategory !== null ? `category_id=${curCategory}` : null;
};
export const getQueryParamsString = (queryParams) => {
  let queryParamsString = "";
  queryParams.forEach((param) => {
    queryParamsString = param ? `${queryParamsString}${param}&` : queryParamsString;
  });
  // add leading '?' removes last '&'
  queryParamsString = "?" + queryParamsString.substring(0, queryParamsString.length - 1);
  // return an empty string if there are no query params
  return queryParamsString === "?" ? "" : queryParamsString;
};

/**
 * Implements the logic of deciding what's the resulting state of an element label based
 * on its current label and the label action
 * @param {The element's current label value. It can be '', 'neg' or 'pos'} currentLabel
 * @param {The label action. It can be: 'neg' or 'pos'} action
 * @returns
 */
export const getNewLabelState = (currentLabel, action) => {
  let documentLabelCountChange;
  let newLabel;
  if (currentLabel === "pos") {
    if (action === "pos") {
      documentLabelCountChange = {
        pos: -1,
        neg: 0,
      };
      newLabel = "none";
    } else if (action === "neg") {
      documentLabelCountChange = {
        pos: -1,
        neg: 1,
      };
      newLabel = "neg";
    }
  } else if (currentLabel === "neg") {
    if (action === "pos") {
      documentLabelCountChange = {
        pos: 1,
        neg: -1,
      };
      newLabel = "pos";
    } else if (action === "neg") {
      documentLabelCountChange = {
        pos: 0,
        neg: -1,
      };
      newLabel = "none";
    }
  } else {
    if (action === "pos") {
      documentLabelCountChange = {
        pos: 1,
        neg: 0,
      };
      newLabel = "pos";
    } else if (action === "neg") {
      documentLabelCountChange = {
        pos: 0,
        neg: 1,
      };
      newLabel = "neg";
    }
  }
  return {
    documentLabelCountChange,
    newLabel,
  };
};

/**
 * Get's the boolean string of a label value, because currently we are using
 * 'pos' or 'neg' for internal labelling processes and 'true' or 'false' for
 * the the REST API.
 * @param {*} label
 * @returns
 */
export const getBooleanLabel = (label) => {
  return label === "pos" ? "true" : label === "neg" ? "false" : "none";
};

export const getStringLabel = (label) => {
  return label === "true" ? "pos" : label === "false" ? "neg" : "none";
};

/**
 * Parses the elements of a document extracting the user labels
 * @param {list of elements of a document} elements
 * @param {The current selected category} curCategory
 * @param {whether to add the id of the element in its entry key} includeId
 * @returns
 */
export const parseElements = (unparsedElements, curCategory) => {
  let elements = {};
  let documentPos = 0;
  let documentNeg = 0;

  unparsedElements.forEach((element) => {
    const userLabels = element["user_labels"];
    elements[element.id] = parseElement(element, curCategory);
    if (curCategory in userLabels) {
      documentPos += userLabels[curCategory] === "true" ? 1 : 0;
      documentNeg += userLabels[curCategory] === "false" ? 1 : 0;
    }
  });

  return {
    elements,
    documentPos,
    documentNeg,
  };
};

export const parseElement = ({ docid, id, model_predictions, user_labels, text }, curCategory) => ({
  docId: docid,
  id: id,
  modelPrediction: getStringLabel(model_predictions[curCategory]),
  userLabel: getStringLabel(user_labels[curCategory]),
  text,
});

export const getPanelDOMKey = (elementId, panelId, index = "") => {
  let res = `${panelId}_${elementId}`;
  if (index !== "") {
    res = `${res}_${index}`;
  }
  return res;
};

export const synchronizeElement = (elementId, userLabel, panels) => {
  let previousLabel = null;
  Object.values(panels).forEach((panel) => {
    const elements = panel.elements;
    if (elements && elementId in elements) {
      // save previous label value
      if (previousLabel === null) {
        previousLabel = elements[elementId].userLabel;
      }
      elements[elementId].userLabel = userLabel;
    }
  });

  return {
    panels,
    previousLabel,
  };
};

export const scrollIntoElementView = (element, smoothly = true) => {
  element &&
    element.scrollIntoView({
      behavior: smoothly ? "smooth" : "auto",
      block: "center",
    });
};

export const getElementIndex = (elementId) => parseInt(elementId.substring(elementId.lastIndexOf("-") + 1));

/**
 * Get the number of pages based on the elements
 * per page and the total elements count. The count
 * starts from 1. To avoid
 * @param {*} elementsPerPage
 * @param {*} elementsCount
 * @returns
 */
export const getPageCount = (elementsPerPage, elementsCount) => Math.ceil(elementsCount / elementsPerPage);

export const getAddedCategoriesNotificationString = (categories) => {
  if (categories.length === 1) return categories[0];
  else {
    let res = "";
    if (categories.length > 2) categories.slice(0, -2).forEach((c) => (res += `${c}, `));
    res += categories.slice(-2, -1)[0] + " and " + categories.slice(-1)[0];
    return res;
  }
};
export const getWorkspaceId = () => {
  return JSON.parse(window.sessionStorage.getItem("workspaceId"));
};
