import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: "",
        completed: false,
      },
      editing: false,
    };
    this.fetchTasks = this.fetchTasks.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getCookie=this.getCookie.bind(this)
    this.startEdit=this.startEdit.bind(this)
    this.deleteItem=this.deleteItem.bind(this)
    this.strikeUnstrike=this.strikeUnstrike.bind(this)
  }

  getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

  componentDidMount() {
    this.fetchTasks()
  }

  fetchTasks() {
    console.log("fetching.....")
    fetch('http://localhost:8000/api/task-list')
      .then(res => res.json())
      .then(data => {
        this.setState({
          todoList: data
        })
      })
  }

  handleChange(e) {
    var name = e.target.name
    var value = e.target.value
    console.log(name, value)
    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value
      }
    })
  }

  handleSubmit(e) {
    e.preventDefault()
    console.log('ITEM: ', this.state.activeItem)

    var csrftoken=this.getCookie('csrftoken')

    var url = 'http://localhost:8000/api/task-create/'

    if(this.state.editing===true){
      url=`http://localhost:8000/api/task-update/${this.state.activeItem.id}`
      this.setState({
        editing:false
      })
    }
    fetch(url, {
      method: "POST",
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken':csrftoken
      },
      body: JSON.stringify(this.state.activeItem)
    }).then(res => {
      this.fetchTasks()
      this.setState({
        activeItem: {
          id: null,
          title: "",
          completed: false,
        }
      })
    }).catch(err => console.log(err))
  }

  startEdit(task){
    this.setState({
      activeItem:task,
      editing:true
    })
  }

  deleteItem(task){
    var csrftoken=this.getCookie('csrftoken')
    fetch(`http://localhost:8000/api/task-delete/${task.id}`,{
      method:'DELETE',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken':csrftoken
      },
    }).then(res=>{
      this.fetchTasks()
    }).catch(err=>console.log(err))
  }

  strikeUnstrike(task){
    task.completed=!task.completed
    var csrftoken=this.getCookie('csrftoken')
    fetch(`http://localhost:8000/api/task-update/${task.id}`,{
      method:"POST",
      headers:{
        'Content-type':'application/json',
        'X-CSRFToken':csrftoken
      },
      body:JSON.stringify({'completed':task.completed,'title':task.title})
    }).then(res=>{
      this.fetchTasks()
    })
  }
  render() {
    var tasks = this.state.todoList
    var self=this
    return (
      <div className="container">
        <div id="task-container">
          <div id="form-wrapper">
            <form onSubmit={this.handleSubmit} id="form">
              <div className="flex-wrapper">
                <div style={{ flex: 6 }}>
                  <input onChange={this.handleChange} className="form-control" id="title" type="text" placeholder="Add a task" name="title" value={this.state.activeItem.title} />
                </div>
                <div style={{ flex: 1 }}>
                  <input className="btn btn-warning" id="title" type="submit" id="submit" />
                </div>
              </div>
            </form>
          </div>
          <div id="list-wrapper">
            {tasks.map((task, index) => {
              return (
                <div key={index} className="task-wrapper flex-wrapper" onClick={()=>self.strikeUnstrike(task)}>
                  <div style={{ flex: 7 }}>
                    {task.completed===false?(
                      <span>{task.title}</span>
                    ):(
                      <strike>{task.title}</strike>
                    )}
                    
                  </div>
                  <div style={{ flex: 1 }}>
                    <button className="btn btn-sm btn-outline-info" onClick={()=>self.startEdit(task)}>Edit</button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <button className="btn btn-sm btn-outline-dark delete" onClick={()=>self.deleteItem(task)}>-</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

    )
  }
}


export default App;
