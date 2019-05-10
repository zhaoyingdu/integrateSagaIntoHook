## copy to use  
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
  }, [])  

  return [state, store.dispatch, store.subscribe, store.replaceReducer, store[$$observable]]
}
export default useStore
```

## example  
first do some setup works.  
```javascript
import useStore from './usestorehook'
import {createStore} from 'redux'
import React from 'react'
const reducer = (S, A)=>{
  return {count: S.count+1}
}
const store = createStore(reducer, {count: 0})
```

now create two components. Both component share the same`state`  
and `dispatch`. The `state` object is a "wrapper" around the  
store's state, which is updated upon every dispatch.  
```javascript
const componentA = ()=>{
  const [state, dispatch] = useStore(store)
  console.log(`
    componentA updated: ${state}
  `)
}
const componentB = ()=>{
  const [state, dispatch] = useStore(store)
  console.log(`
    componentB updated: ${state}
  `)
  
  useEffect(()=>{
    const timer = setInterval(()=>{
      dispatch({type: "dummy"})
    }, 1000)
    return ()=>clearInterval(timer)
  }.[])
}
```
