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

import { useDispatch, useSelector } from "react-redux";
import { changeCurrentDocument, clearMainPanelFocusedElement } from "../modules/Workplace/redux";

const useFetchPrevNextDoc = () => {
  const curDocId = useSelector((state) => state.workspace.curDocId);
  const documents = useSelector((state) => state.workspace.documents);
  const dispatch = useDispatch();
  const mainPanelElementsPerPage = useSelector((state) => state.featureFlags.mainPanelElementsPerPage);

  const handleFetchNextDoc = () => {
    if (curDocId < documents.length - 1) {
      dispatch(clearMainPanelFocusedElement());
      dispatch(changeCurrentDocument({ newDocId: documents[curDocId + 1]["document_id"], mainPanelElementsPerPage }));
      // this action is currently focusing the first element of the previous document
      // it works, but ideally the first element of the new document should be focused
    }
  };

  const handleFetchPrevDoc = () => {
    if (curDocId > 0) {
      dispatch(clearMainPanelFocusedElement());
      dispatch(changeCurrentDocument({ newDocId: documents[curDocId - 1]["document_id"], mainPanelElementsPerPage }));
    }
  };

  return {
    handleFetchPrevDoc,
    handleFetchNextDoc,
  };
};
export default useFetchPrevNextDoc;
