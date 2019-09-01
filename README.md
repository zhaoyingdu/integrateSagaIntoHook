# custom useStore hook  

## purpose  
by using this hook, you can use one Store object in multiple React components, unlike useReducer, which require the reducer share by parent and children. useStore can be used by unrelated components, just like how you use `connect` api in react-redux to share the same store/reducer between multiple components. 

## usage  
install or copy to use  
### install 
```  
npm install customhook-usestore --save
```
### copy to use  
make sure `symbol-observable` is installed
```javascript  
import {useState, useEffect} from "react";
import $$observable from 'symbol-observable'

const useStore = (store)=>{
  const [state, setState] = useState(store.getState())
  useEffect(()=>{
    const observer = store[$$observable]()
    observer.subscribe({
      next: state=>{
        setState(state)
      }
    })
    return ()=>observer.unsubscribe()
  }, [])  

  return [state, store.dispatch, store.subscribe, store.replaceReducer, store[$$observable]]
}
export default useStore
```

## link
[github](https://github.com/zhaoyingdu/useStore)

## example  

checklist:  
1. make sure your package is created by create-react-app. because example syntax use ES6 import/export syntax
2. installed redux and customhook-usestore as dependency


```javascript 
import useStore from 'customhook-usestore'
import {createStore} from 'redux'
import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom';

const reducer = (S, A)=>{
  return {count: S.count+1}
}
const store = createStore(reducer, {count: 0})

const ComponentA = ()=>{
  const [state, dispatch] = useStore(store)
  return ( 
    <p>
      count displayed by component A: {state.count}
    </p>
  )
}
const ComponentB = ()=>{
  const [state, dispatch] = useStore(store)
  
  const [updateCount, setUpdateCount] = useState(0)

  useEffect(()=>{
    const timer = setInterval(()=>{
      dispatch({type: "dummy"})
      setUpdateCount(prev=>prev+1);
    }, 1000)
    return ()=>clearInterval(timer)
  }, [])

  return (
    <p>
      count displayed by component B: {state.count}
      <br />
      Component B has updated state in our store {updateCount} times.
    </p>
  )

}

ReactDOM.render(
  <div>
    <ComponentA />
    <ComponentB />
  </ div>, document.getElementById('root')
); 
```
