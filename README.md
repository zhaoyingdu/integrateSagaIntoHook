### example usage  

first do some setup works.  
```javascript
import useStore from 'usestorehook'
import {createStore} from 'redux'
import React from 'react'
const reducer = (S, A)=>{
  return {count: S.count+1}
}
const store = createStore(reducer, {count: 0})
```

now create two components. Both component share the `state`  
and `dispatch`. The `state` object is a "wrapper" around the  
store's state, which is updated upon every dispatch.  
```javascript
const componentA = ()=>{
  const [state, dispatch] = useStore(store)
  console.log(`
    conponentA reporting: state updated
  `)
}
const componentB = ()=>{
  const [state, dispatch] = useStore(store)
  console.log(`
    conponentB reporting: state updated
  `)
}
```

create another component to dispatch action every 1 second.  
The state update is shared by all three components
```javascript
const componentC = ()=>{
  const [state, dispatch] = useStore(store)  
  useEffect(()=>{
    const timer = setInterval(()=>{
      dispatch({type: "dummy"})
    }, 1000)
    return ()=>clearInterval(timer)
  }.[])
}
```