//add functional code
//classes to represent Sessions and their Sections in the After School Enrichment Program.
//class for Session Service to enable sending AJAX httpRequests to pre-existing API data
//class to manage the DOM

class Session{
    constructor(name, day, sizeLimit){
        this.name=name;
        this.day=day;
        this.sizeLimit=sizeLimit;
        this.students=[];
    }

    //method to add students to the array declared in this Session class
    addStudent(firstName, lastName, gradeLevel, parentPermission){
        this.students.push(new Student(firstName, lastName, gradeLevel, parentPermission));
    }
} //end Session class

class Student{
    constructor(firstName, lastName, gradeLevel, parentPermission){
        this.firstName=firstName;
        this.lastName=lastName;
        this.gradeLevel=gradeLevel;
        this.parentPermission=parentPermission;
    }
} //end Student class

//create the Service how to send the http requests.
class SessionService{
    static url='https://640486a73bdc59fa8f3ad6f4.mockapi.io/School_Sessions_API/sessions';
    
    static getAllSessions() {
        return $.get(this.url); //jquery GET
    }
    
    static getSession(id){
        return $.get(this.url + `/${id}`); 
    }

    static createSession(session){
        return $.post(this.url, session);
    }

    static updateSession(session){
        return $.ajax({ 
            url: this.url + `/${session._id}`, //_id is ID value automatically assigned by the database
            dataType: 'json',
            data: JSON.stringify(session),
            contentType: 'application/json',
            type: 'PUT'
        });
    }

    static deleteSession(id){
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
} //end SessionService class

//rerender DOM 
class DOMManager{
  static sessions;  

  static getAllSessions(){ //from above calls the getAllSessions method inside the class SessionService
    //returns a Promise so use .then for data we get back from service and rerenders the DOM.
    SessionService.getAllSessions().then(sessions => this.render(sessions));
  }

//sends request to create session and return the updated all sessions data. then render all the sessions with the updated data.

  static createSession(name, day, sizeLimit){
    SessionService.createSession(new Session(name, day, sizeLimit))
        .then(()=> {
            return SessionService.getAllSessions();
        })
        .then((sessions) => this.render(sessions));
  }

  //sends request to delete session and return the updated all sessions data. then render all the sessions with the upated data.

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
        if (session._id == id) {
            session.students.push(new Student($(`#${session._id}-first-name`).val(), $(`#${session._id}-last-name`).val(), $(`#${session._id}-grade-level`).val(), $(`#${session._id}-parent-permission`).val()));
            console.log(session.students);
            SessionService.updateSession(session)
            .then(()=> {
                return SessionService.getAllSessions();
            })
            .then((sessions)=> this.render(sessions));     
     }
    } 
  }

  static deleteStudent(sessionId, studentId){
    for (let session of this.sessions){
      if (session._id == sessionId) {
        for (let student of session.students){
            if (student._id == studentId){
                session.students.splice(session.students.indexOf(student), 1);
                SessionService.updateSession(session)
                .then(()=>{
                    return SessionService.getAllSessions();
                })
                .then((sessions)=>this.render(sessions));
                } //end inner if 
            } //end inner for loop
        } //end outer if
      } //end outer for loop
    }//end static

 
  static render(sessions){
    this.sessions=sessions;
    $('#app').empty(); //finds the app id in html . empty clears every time before app is rerendered.
    for (let session of sessions) { //for loop to render each session
        $('#app').prepend( //use prepend so newest one shows up on top
        //write html in javascript. use template literal ``
        //div card body for inputs of students in a session 
        `<div id="${session._id}" class="card">
            <div class="card-header">
             <h2>${session.name}</h2>
             <button class="btn btn-danger" onclick="DOMManager.deleteSession('${session._id}')">Delete</button> 
            </div>
            <div class="card-body">
             <div class="card">
              <div class="row">
               <div class="col-sm">
                <input type="text" id="${session._id}-first-name" class="form-control" placeholder="Student First Name">
               </div>
               <div class="col-sm">
                <input type="text" id="${session._id}-last-name" class="form-control" placeholder="Student Last Name">
               </div>
               <div class="col-sm">
                <input type="text" id="${session._id}-grade-level" class="form-control" placeholder="Student Grade Level">
               </div>
               <div class="col-sm">
                <input type="text" id="${session._id}-parent-permission;" class="form-control" placeholder="Parent Permission Received">
               </div>
             </div>
             <button id="${session._id}-new-student" onclick="DOMManager.addStudent('${session._id}')" class="btn btn-dark form-control">Add</button>
            </div>
           </div> 
        </div><br>`//end template literal
        
        );  //end prepend

        //nested for loop for students in session to render
        for (let student of session.students){
            $(`#${session._id}`).find('.card-body').append(
              `<p>
                <span id="first-name-${student._id}"><strong>First Name: </strong> ${student.firstName}</span>
                <span id="last-name-${student._id}"><strong>Last Name: </strong> ${student.lastName}</span>
                <span id="grade-level-${student._id}"><strong>Grade Level: </strong> ${student.gradeLevel}</span>
                <span id="parent-permission-${student._id}"><strong>Parent Permission Received: </strong> ${student.parentPermission}</span>
                <button class="btn btn-danger" onclick="DOMManager.deleteStudent('${session._id})', '${student._id}')">Delete Student</button>
                </p>` //end template literal.
            ); //end append
        } //end for loop for students in session to be rendered
    } //end for loop for sessions to be rendered
  }

}//end DOMManager class

$('#create-new-session').click(()=>{
  DOMManager.createSession($('#new-session-name').val());
  $('new-session-name').val(''); //reset to empty after new session created
});

//DOMManager.getAllSessions();