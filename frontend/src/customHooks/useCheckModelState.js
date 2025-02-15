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

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkModelUpdate } from "../modules/Workplace/redux/modelSlice";
import { decreaseModelStatusCheckAttempts } from "../modules/Workplace/redux";

export const useCheckModelState = ({ curCategory, checkModelInterval }) => {
  /**
   * Update the model state every checkModelInterval milliseconds
   * Do it only if nextModelShouldBeTraining is true
   */
  const dispatch = useDispatch();
  const nextModelShouldBeTraining = useSelector((state) => state.workspace.nextModelShouldBeTraining);
  const modelStatusCheckAttempts = useSelector((state) => state.workspace.modelStatusCheckAttempts);

  useEffect(() => {
    const interval = setInterval(() => {
      if (curCategory !== null && (nextModelShouldBeTraining || modelStatusCheckAttempts > 0)) {
        dispatch(checkModelUpdate());
        if (modelStatusCheckAttempts > 0) {
          dispatch(decreaseModelStatusCheckAttempts())
        }
      }
    }, checkModelInterval);

    return () => clearInterval(interval);
  }, [curCategory, checkModelInterval, nextModelShouldBeTraining, modelStatusCheckAttempts, dispatch]);
};
