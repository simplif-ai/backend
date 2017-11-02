const assert = require('assert');
const app = require('./../app.js')
const mocha = require('mocha');
let chai = require('chai');
let chaiHttp = require('chai-http');
var json2plain = require('json2plain');
let should = chai.should();

chai.use(chaiHttp);

//Test creating saving summary to db by creating note and summary 
describe('Save summary to db', () => {
	
  it('You should return the new noteId', (done) => {
    //the text to send to request
    var req = {
        email: "test@gmail.com", 
        text: "testcase 1"
    }
    var reqtext = JSON.stringify(req);
    chai.request(app)
    .post('/createnote')
    .set('content-type', 'text/plain')
    .send(reqtext)
    .end((err, res)=>{
        //console.log("error: ", err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('noteID');
        done();
    });

  });
});

//Test saving/updating notes to db note table by updateing noteText 
describe('save/update notes to db without note name', () => {

  it('You should return sucess: true', (done) => {
    //the text to send to request
    var req = {
        "noteID": "27",
        "noteText" : "testcase 2"
    }
    var reqtext = JSON.stringify(req);
    chai.request(app)
    .post('/updatenote')
    .set('content-type', 'text/plain')
    .send(reqtext)
    .end((err, res)=>{
        //console.log("error: ", err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('success').eql(true);
        done();
    });

  });
});

//Test saving/updating notes to db note table by updateing noteText 
//and adding/updating name to note
describe('save/update notes to db with note name', () => {
	
  it('You should return sucess: true', (done) => {
    //the text to send to request
    var req = {
        "noteID": "27",
        "name": "3nameTest",
        "noteText" : "testcase 3"
    }
    var reqtext = JSON.stringify(req);
    chai.request(app)
    .post('/updatenote')
    .set('content-type', 'text/plain')
    .send(reqtext)
    .end((err, res)=>{
        //console.log("error: ", err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('success').eql(true);
        done();
    });

  });
});

//Test saving/updating name of note to db
describe('save/update name of notes to db', () => {

  it('You should return sucess: true', (done) => {
    //the text to send to request
    var req = {
        "noteID": "27",
        "name": "4nameTest",
    }
    var reqtext = JSON.stringify(req);
    chai.request(app)
    .post('/updatenote')
    .set('content-type', 'text/plain')
    .send(reqtext)
    .end((err, res)=>{
        //console.log("error: ", err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('success').eql(true);
        done();
    });

  });
});
