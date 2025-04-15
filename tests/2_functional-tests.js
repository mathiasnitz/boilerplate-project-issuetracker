const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let testId1;
let testId2;

suite('Functional Tests', function () {
  suite('POST /api/issues/{project} => object with issue data', function () {
    test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/test')
        .send({
          issue_title: 'Title 1',
          issue_text: 'Text 1',
          created_by: 'Functional Test - Every field',
          assigned_to: 'Chai',
          status_text: 'In QA',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title 1');
          assert.equal(res.body.issue_text, 'Text 1');
          assert.equal(res.body.created_by, 'Functional Test - Every field');
          assert.equal(res.body.assigned_to, 'Chai');
          assert.equal(res.body.status_text, 'In QA');
          testId1 = res.body._id;
          done();
        });
    }).timeout(20000);

    test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/test')
        .send({
          issue_title: 'Title 2',
          issue_text: 'Text 2',
          created_by: 'Functional Test - Required fields',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title 2');
          assert.equal(res.body.issue_text, 'Text 2');
          assert.equal(res.body.created_by, 'Functional Test - Required fields');
          testId2 = res.body._id;
          done();
        });
    }).timeout(20000);

    test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/test')
        .send({
          issue_title: 'Title 3',
          issue_text: 'Text 3',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    }).timeout(20000);
  });

  suite('GET /api/issues/{project} => Array of objects with issue data', function () {
    test('View issues on a project: GET request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/test')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    }).timeout(20000);

    test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/test')
        .query({ _id: testId1 })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body[0].issue_title, 'Title 1');
          done();
        });
    }).timeout(20000);

    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/test')
        .query({
          issue_title: 'Title 1',
          issue_text: 'Text 1',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body[0].issue_title, 'Title 1');
          assert.equal(res.body[0].issue_text, 'Text 1');
          done();
        });
    }).timeout(20000);
  });

  suite('PUT /api/issues/{project} => text', function () {
    test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/test')
        .send({
          _id: testId1,
          issue_title: 'Updated issue title 1',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { result: 'successfully updated', _id: testId1 });
          done();
        });
    }).timeout(20000);

    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/test')
        .send({
          _id: testId2,
          issue_title: 'Updated issue title 2',
          issue_text: 'Updated issue text 2',
          assigned_to: 'John Doe',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { result: 'successfully updated', _id: testId2 });
          done();
        });
    }).timeout(20000);

    test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/test')
        .send({ issue_title: 'no id' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'missing _id' });
          done();
        });
    }).timeout(20000);

    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/test')
        .send({ _id: testId1 })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: testId1 });
          done();
        });
    }).timeout(20000);

    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/test')
        .send({ _id: 'invalidid123', issue_title: 'will fail' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'could not update', _id: 'invalidid123' });
          done();
        });
    }).timeout(20000);
  });

  suite('DELETE /api/issues/{project} => text', function () {
    test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/test')
        .send({ _id: testId1 })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { result: 'successfully deleted', _id: testId1 });
          done();
        });
    }).timeout(20000);

    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/test')
        .send({ _id: 'invalidid123' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'could not delete', _id: 'invalidid123' });
          done();
        });
    }).timeout(20000);

    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/test')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'missing _id' });
          done();
        });
    }).timeout(20000);
  });
});