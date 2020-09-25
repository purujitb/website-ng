## LambdaOp
```python
LambdaOp(*args, **kwargs)
```
An Operator that performs any specified function as forward function.


#### Args:

* **fn** :  The function to be executed.
* **inputs** :  Key(s) from which to retrieve data from the data dictionary.
* **outputs** :  Key(s) under which to write the outputs of this Op back to the data dictionary.
* **mode** :  What mode(s) to execute this Op in. For example, "train", "eval", "test", or "infer". To execute        regardless of mode, pass None. To execute in all modes except for a particular one, you can pass an argument        like "!infer" or "!train".