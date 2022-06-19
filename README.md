# Label Sleuth Classification Framework

**Label Sleuth** is an open source tool for annotating and classifying texts.

As users label textual examples within the system, machine learning models train in the background, make predictions on new examples, and provide suggestions for the user on the examples they should label next.
This interactive system enables users to efficiently collect data for varied tasks and to easily build text classification models, all without requiring any machine learning expertise.


**Table of contents**

[Installation](#installation)

[Project structure](#project-structure)

[Customizing the system](#customizing-the-system)
* [System configuration](#system-configuration)
* [Implementing new components](#implementing-new-components)

## Installation
Currently, the framework requires Python 3.8
1. Clone the repository: 

   `git clone git@github.com:label-sleuth/label-sleuth.git`
2. cd to the cloned directory: `cd label-sleuth`
3. Install the project dependencies using `conda` (recommended) or `pip`:
<details><summary><b>Installing with <tt>conda</tt></b></summary>
<p>

- Install Anaconda https://docs.anaconda.com/anaconda/install/index.html

- Restart your console

- Use the following commands to create a new anaconda environment and install the requirements:
```bash
# Create and activate a virtual environment:
conda create --yes -n label-sleuth python=3.8
conda activate label-sleuth
# Install requirements
pip install -r requirements.txt
```
</p>
</details>
<details><summary><b>Installing with <tt>pip</tt></b></summary>
<p>
Assuming python 3.8 is already installed.

- Install pip https://pip.pypa.io/en/stable/installation/

- Restart your console

- Install requirements:
```bash
pip install -r requirements.txt
```
</p>
</details>

4. Start the Label Sleuth server: run `python -m label_sleuth.start_label_sleuth`.
   
   By default all project files are written to `<home_directory>/label-sleuth`, to change the directory add `--output_path <your_output_path>`. Default port is 8000, to change the port add `--port <port_number>`.

   The system can then be accessed by browsing to http://localhost:8000 (or http://localhost:<port_number>)

## Project Structure
The repository consists of a backend library, written in Python, and a frontend that uses React. A compiled version of the frontend can be found under `label_sleuth/build`.

## Customizing the system

### System configuration
The configurable parameters of the system are specified in a json file. The default configuration file is [label_sleuth/config.json](label_sleuth/config.json).

A custom configuration can be applied by passing the `--config_path` parameter to the "start_label_sleuth" command, e.g., `python -m label_sleuth.start_label_sleuth --config_path <path_to_my_configuration_json>`

**Configurable parameters:**
- _first_model_positive_threshold_: determines the number of elements that must be assigned a positive label for the category in order to trigger the training of a classification model.
- _changed_element_threshold_: determines the number of changes in user labels for the category -- relative to the last trained model -- that are required to trigger the training of a new model. A change can be a assigning a label (positive or negative) to an element, or changing an existing label. Note that  _first_model_positive_threshold_ must also be met.
- _training_set_selection_strategy_: specifies the strategy to be used from [TrainingSetSelectionStrategy](https://github.com/label-sleuth/label-sleuth/blob/316bacb7cca7d7b78a11b96d397aac9bfd7e33bf/label_sleuth/training_set_selector/train_set_selector_api.py#L9). A TrainingSetSelectionStrategy determines which examples will be sent in practice to the classification models at training time - these will not necessarily be identical to the set of elements labeled by the user. For currently supported implementations see [get_training_set_selector()](https://github.com/label-sleuth/label-sleuth/blob/316bacb7cca7d7b78a11b96d397aac9bfd7e33bf/label_sleuth/training_set_selector/training_set_selector_factory.py#L7).
- _model_policy_: specifies the policy to be used from [ModelPolicies](https://github.com/label-sleuth/label-sleuth/blob/316bacb7cca7d7b78a11b96d397aac9bfd7e33bf/label_sleuth/models/core/model_policies.py#L5). A [ModelPolicy](https://github.com/label-sleuth/label-sleuth/blob/316bacb7cca7d7b78a11b96d397aac9bfd7e33bf/label_sleuth/models/policy/model_policy.py#L6) determines which type of classification model(s) will be used, and _when_ (e.g. always / only after a specific number of iterations / etc.).
- _active_learning_strategy_: specifies the strategy to be used from [ActiveLearningStrategies](https://github.com/label-sleuth/label-sleuth/blob/316bacb7cca7d7b78a11b96d397aac9bfd7e33bf/label_sleuth/active_learning/core/active_learning_strategies.py#L4). An [ActiveLearner](https://github.com/label-sleuth/label-sleuth/blob/316bacb7cca7d7b78a11b96d397aac9bfd7e33bf/label_sleuth/active_learning/core/active_learning_api.py#L11) module implements the strategy for recommending the next elements to be labeled by the user, aiming to increase the efficiency of the annotation process. For currently supported implementations see [get_active_learner()](https://github.com/label-sleuth/label-sleuth/blob/316bacb7cca7d7b78a11b96d397aac9bfd7e33bf/label_sleuth/active_learning/core/active_learning_factory.py#L8).
- _precision_evaluation_size_: determines the sample size to be used for estimating the precision of the current model.
- _apply_labels_to_duplicate_texts_: specifies how to treat elements with identical texts. If `true`, assigning a label to an element will also assign the same label to other elements which share the exact same text; if `false`, the label will only be assigned to the specific element labeled by the user.
- _login_required_: specifies whether or not using the system will require user authentication. If `true`, the configuration file must also include a `users` parameter, mapping the keys and values of the [User](https://github.com/label-sleuth/label-sleuth/blob/316bacb7cca7d7b78a11b96d397aac9bfd7e33bf/label_sleuth/configurations/users.py#L5) dataclass for each user.



### Implementing new components
<details><summary><b>Implementing a new machine learning model</b></summary>

   These are the steps for integrating a new classification model:
   1. Implement a new `ModelAPI`
   
   Machine learning models are integrated by adding a new implementation of the ModelAPI.
   
   The main functions are *_train()* and *_infer()*:
   
   ```python
   def _train(self, model_id: str, train_data: Sequence[Mapping], train_params: dict):
   ```
   - model_id     
   - train_data - a list of dictionaries with at least the "text" and "label" fields. Additional fields can be passed e.g.
   *[{'text': 'text1', 'label': 1, 'additional_field': 'value1'}, {'text': 'text2', 'label': 0, 'additional_field': 'value2'}]*
   - train_params - dictionary for additional train parameters (can be None)

   ```python
   def _infer(self, model_id, items_to_infer: Sequence[Mapping]) -> Sequence[Prediction]:
   ```
   - model_id
   - items_to_infer: a list of dictionaries with at least the "text" field. Additional fields can be passed,
   e.g. *[{'text': 'text1', 'additional_field': 'value1'}, {'text': 'text2', 'additional_field': 'value2'}]*
   
   Returns a list of [Prediction](https://github.com/label-sleuth/label-sleuth/blob/1424a9ab01697e12396bc33fd608158d61d55e24/label_sleuth/models/core/prediction.py#L20) objects - one for each item in *items_to_infer* - where 
    Prediction.label is a boolean and Prediction.score is a float in the range [0-1].
    Additional outputs can be passed by inheriting from the base Prediction class and overriding the get_predictions_class() method.
   
   2. Add the newly implemented ModelAPI to `ModelsCatalog`
   
   3. Add one or more policies that use the new model to `ModelPolicies`
   
</details>

<details>
   <summary><b>Implementing a new active learning strategy</tt></b></summary>
<p>
These are the steps for integrating a new active learning approach:

   1. Implement a new `ActiveLearner`
   
   Active learning modules are integrated by adding a new implementation of the ActiveLearner API.
   The function to implement is *get_per_element_score*:
   ```python
    def get_per_element_score(self, candidate_text_elements: Sequence[TextElement],
                              candidate_text_element_predictions: Sequence[Prediction], workspace_id: str,
                              dataset_name: str, category_name: str) -> Sequence[float]:    
   ```    
   Given sequences of text elements and the model predictions for these elements, this function returns an active learning score for each element.
   The elements with the highest scores will be recommended for the user to label next.
   
   2. Add the newly implemented ActiveLearner to the `ActiveLearningCatalog`
   </p>
   </details>
