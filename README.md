## install  
```  
npm install customhook-usestore --save
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
      count displayed by component A: {state}
    </p>
  )
}
const ComponentB = ()=>{
  const [state, dispatch] = useStore(store)
  
  const [updateCount, setUpdateCount] = useState(0)

  useEffect(()=>{
    const timer = setInterval(()=>{
      dispatch({type: "dummy"})
      setUpdateCount(prev=>prev++);
    }, 1000)
    return ()=>clearInterval(timer)
  }, [])

  return (
    <p>
      count displayed by component B: {state}
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
