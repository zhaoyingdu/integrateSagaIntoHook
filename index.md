# Integrate Redux-saga into React hooks - Iteration logs

## Iteration 1
**objective:** connect useReducer with redux-saga.  
**overview:**  
Idea comes from redux's official site [middleware#monkeypatch-middleware](https://redux.js.org/advanced/middleware#attempt-3-monkeypatching-dispatch), redux use middleware to utilize the phase between action is fired(* like when user invoked a dispatch function) and is dispatched(* the action is captured by the reducer). middlewares are "functions" that can intercept this phase, access the action object and do something about it, like logging out the action to console.  
**key words:** monkeyPatch, redux middlewares' concept  
**links:** [reduxMiddleware#monkeypatch](https://redux.js.org/advanced/middleware#attempt-3-monkeypatching-dispatch)  
**implementation:**  
![component and action flow](./assets/monkeyPatchStore.png)  


## Iteration 2
**objective:** connect multiple useReducer Together by using redux-saga  
**Overview:**  
Enhancing Iteration 1 by allowing multiple useReducer's to use one SagaMiddleWare. Idea comes from redux's store structure. Redux-store 
allows you to use one store in multiple UI component. On the other hand, useReducer usually deals with state of one component tree(the 'root' node and its children). Hopefully, by 'namespacing' each useReducer, we can connect two sibling(or far away) components together, let them share come related state transactions.  
**key words:** connecting multiple reducers  
**implementation:**  
To connect useReducers, a key is assigned to each reducer when patched. Apparently on each render, useReducer is Called once, meaning patchStore is also called each time. So it seems proper to put the patch store call after useReducer call, because we need to patch it every time, otherwise the dispatch would just be the plain dispatch freshly returned from useRecuder(.. , ..).  
However, to connect stores together, sage would have to iterate through all connected stores and dispatch actions on each of them. so the problem arise, where and when should you save those stores in a pool? current stategy is to store them upon calling patchStore, like this:    
```javascript
  patchReducerWithSaga({key:'counterSum', store})
```  
reason there is a key property is because...:  
```javascript
  const patchReducerWithSaga = ({key, store}) =>{  
    _.find(stores, {key:key})? _.noop():stores.push({key, store}) 
   ...
  }
```  
The stores are saved in an array, and because patchStore is invoked on each re-render, key is therefore used to avoid pushing 'same' store twice(eventhough old store is discarded from react's mistery storage, evidence can be seen from dispatch being invoked 'once', on the currently existing 'store')  
anthor place this array is used is here:  
```javascript
 const IO = {
  channel,
  dispatch: (actionObj)=>{
    _.forEach(stores, keyedStore=>{
      const dispatch = keyedStore.store[1]
      dispatch(actionObj)
    })
    //dispatch(actionObj) //dispatch to reducer
  }
  ...
 }
```  
here the dispatch property is local to the saga IO, invoked by channel.put, or yield put(...) in saga functions, so on each actions dispatched by saga or react component, an iteration occured to broadcast that action to every store in the array of stores.ONLY store with reducer catching the action would do something about it.  
**note:**  
redux saga is good at implementing 'request'->'side effect'->'dispatch' type of flow. if an action is deemed to dispatched by ui component and reflected directly by reducer, then it probably should be ignored by saga. only use saga to monitor action with side effect. because saga middleware create a copy of the action, dispatch one directly to store, another to saga channel which eventually can be read by take effect.  
todo: verify this behaviour with createSagaMiddleWare


## Iteration 3
**objective:** improvement on iteration 2 a bit more coherent to react's render concept. 
**overview:**  
Enhancing Iteration 2.  
components have ioslated react dispatch, but share the result of saga effect(to be explicit, the 'put' effect).  
I.e. one component's saga can use put effect to dispatch actions to all connected component's reducer.  
**key words:** isolated hook dispatch, shared saga effect  
**API:**  
Steps to create shared saga with multiple useReducer:  
1. create a sharedChannel object  
2. stepTwo: pass that object a prop to component who will use useReducer and would like to connect to this common channel with some
3. other component.  
4. stepThree: use customized hook, useSagaReducer  
