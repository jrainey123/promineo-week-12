//Week 12 Coding Assignment
// [x] Create a full CRUD application of your choice using either an API or local Array.
// [x] Use an existing API with AJAX to interact with it. 
// [NA] If you do not use an API, store the entities you will create, read, update, and delete in an array.
// [x] Use a form to post new entities.
// [x] Build a way for users to update or delete entities.
// [x] Use Bootstrap and CSS to style your project.
// Project is an After School Enrichment Program
// Sessions for the program will be added including name, day, and size limit.
// In each of the sessions students will be added including first name, last name, and grade level.

class Session{
    constructor(name, day, sizeLimit){
        this.name=name;
        this.day=day;
        this.sizeLimit=sizeLimit;
        this.students=[];
    }

    //method to add students to the array declared in this Session class

    addStudent(firstName, lastName, gradeLevel){
        this.students.push(new Student(firstName, lastName, gradeLevel));
    }
} //end Session class

class Student{
    constructor(firstName, lastName, gradeLevel){
        this.firstName=firstName;
        this.lastName=lastName;
        this.gradeLevel=gradeLevel;
    }
} //end Student class

//create the Service - how to send the http requests.  Using MockAPI.
//static methods belong to the class rather than an instance of that class. An instance is not needed to call such static methods. Static methods are called on the class directly.
class SessionService{
    static url='https://640486a73bdc59fa8f3ad6f4.mockapi.io/School_Sessions_API/sessions';
    //returns included so methods can be reused and handle the promises that come back. Useful in larger applications.
    static getAllSessions() {
        return $.get(this.url); //jquery GET = Read (C R U D)
    }
    
    static getSession(id){
        return $.get(this.url + `/${id}`); 
    }

    static createSession(session){
        return $.post(this.url, session); //jquery POST = Create (C R U D)
    }

    static updateSession(session){
        return $.ajax({ 
            url: this.url + `/${session._id}`, //_id is ID value automatically assigned by the API
            dataType: 'json',
            data: JSON.stringify(session),
            contentType: 'application/json',
            type: 'PUT' //jquery ajax PUT = Update (C R U D)
        });
    }

    static deleteSession(id){
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE' //jquery ajax DELETE = Delete (C R U D)
        });
    }
} //end SessionService class

//rerender DOM 
class DOMManager{
  static sessions;  

  static getAllSessions(){ //from above calls the getAllSessions method inside the class SessionService, an asynchronous task. 
    //returns a Promise so use .then() method for data we get back from service and rerenders the DOM.
    SessionService.getAllSessions().then(sessions => this.render(sessions));
  }

//sends request to create session and return the updated all sessions data. Then render all the sessions with the updated data.

  static createSession(name, day, sizeLimit){
    SessionService.createSession(new Session(name, day, sizeLimit))
        .then(()=> {
            return SessionService.getAllSessions();
        })
        .then((sessions) => this.render(sessions));
  }

  //sends request to delete session and return the updated all sessions data. Then render all the sessions with the upated data.

  static deleteSession(id){
    SessionService.deleteSession(id)
    .then(()=> {
        return SessionService.getAllSessions();
    })
    .then((sessions)=> this.render(sessions));
  }

  static addStudent(id){
    for (let session of this.sessions){
      console.log(this.sessions);
      console.log(session);
      if(session._id==id){
      session.students.push(new Student($(`#${session._id}-first-name`).val(), $(`#${session._id}-last-name`).val(), $(`#${session._id}-grade-level`).val()));
      console.log(session.students);
      SessionService.updateSession(session)
        .then(()=> {
        return SessionService.getAllSessions();
        })
        .then((sessions)=> this.render(sessions));     
     }
    } 
  }

  //static deleteStudent(sessionId, studentId){  There is no need for the studentId. updated code in line below.
    static deleteStudent(sessionId){
    for (let session of this.sessions){
      if (session._id == sessionId) {
        for (let student of session.students){
            //if (student._id == studentId){  There is no need for the studentId. deleted this if statement.
                session.students.splice(session.students.indexOf(student), 1);
                SessionService.updateSession(session)
                .then(()=>{
                    return SessionService.getAllSessions();
                })
                .then((sessions)=>this.render(sessions));
               // } //end inner if - deleted/commented out
            } //end inner for loop
        } //end outer if
      } //end outer for loop
    }//end static
 
  static render(sessions){
    //let selectMenuOptions=document.querySelector(".form-select"); DELETE
    //console.log(selectMenuOptions); DELETE
    this.sessions=sessions;
    $('#app').empty(); //using jquery $('') empty() method. finds the app id in html . empty clears every time before app is rerendered.
    for (let session of sessions) { //for loop to render each session
      console.log(session); //for troubleshooting. not needed for app to function.
        $('#app').prepend( //use prepend so newest one shows up on top
        //write html in javascript. use template literal ``
        //div card-body for Form Inputs of students in a session. Using Bootstrap and CSS to Style. 
        `<div id="${session._id}" class="card">
            <div class="card-header">
             <h4>${session.name} on ${session.day} - Size Limit: ${session.sizeLimit}</h4>  
             <button class="btn btn-warning" onclick="DOMManager.deleteSession('${session._id}')">Delete</button> 
            </div>
            <div class="card-body">
             <div class="card">
              <div class="row">
               <div class="col-sm">
               <br> 
               <input type="text" id="${session._id}-first-name" class="form-control" placeholder="Student First Name">
               </div>
               <div class="col-sm">
               <br>
                <input type="text" id="${session._id}-last-name" class="form-control" placeholder="Student Last Name">
               </div>
               <div class="col-sm">
               <h6>Student Grade Level (select one)</h6>
               <select type="dropdown-menu" class="caret" id="${session._id}-grade-level" class="form-control">
               <option value="3rd Grade">3rd Grade</option>
               <option value="4th Grade">4th Grade</option>
               <option value="5th Grade">5th Grade</option>
               </select>
               </div>
              </div>
             <button id="${session._id}-new-student" onclick="DOMManager.addStudent('${session._id}')" class="btn btn-dark form-control">Add</button>
            </div>
           </div> 
        </div><br>`//end template literal
        );  //end prepend

        //nested for loop for students in session to render
        for (let student of session.students){
          console.log(session); //for troubleshooting. not needed for app to function.
            $(`#${session._id}`).find('.card-body').append( //jquery $() will get the element by the id in the template literal and find() the style element to append to.
              `<p>
                <span id="first-name-${student._id}"><strong>Student Name: </strong> ${student.firstName} ${student.lastName}</span>
                <span id="grade-level-${student._id}"><strong>Grade Level: </strong> ${student.gradeLevel}</span>
                <button class="btn btn-warning" onclick="DOMManager.deleteStudent('${session._id}', '${student._id}')">Delete Student</button>
                </p>` //end template literal.
            ); //end append
        } //end for loop for students in session to be rendered
    } //end for loop for sessions to be rendered
  }

}//end DOMManager class

$('#create-new-session').click(()=>{
  DOMManager.createSession($('#new-session-name').val(), $('#new-session-day').val(), $('#new-session-sizeLimit').val());
  $('#new-session-name').val(''); //reset to empty after new session created
  $('#new-session-day').val('');
  $('#new-session-sizeLimit').val('');
});
//END