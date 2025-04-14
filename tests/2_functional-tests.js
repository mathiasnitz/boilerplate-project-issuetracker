const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  let testId;

  suite('POST /api/issues/{project}', function () {
    test('Create an issue with every field', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          testId = res.body._id;
          done();
        });
    });

    test('Create an issue with only required fields', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Required fields',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Required fields');
          done();
        });
    });

    test('Create an issue with missing required fields', function (done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });

  suite('GET /api/issues/{project}', function () {
    test('View issues on a project', function (done) {
      chai
        .request(server)
        .get('/api/issues/test')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues on a project with one filter', function (done) {
      chai
        .request(server)
        .get('/api/issues/test')
        .query({ created_by: 'Functional Test - Every field' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach((issue) => {
            assert.equal(issue.created_by, 'Functional Test - Every field');
          });
          done();
        });
    });

    test('View issues on a project with multiple filters', function (done) {
      chai
        .request(server)
        .get('/api/issues/test')
        .query({ open: true, created_by: 'Functional Test - Every field' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach((issue) => {
            assert.equal(issue.created_by, 'Functional Test - Every field');
            assert.equal(issue.open, true);
          });
          done();
        });
    });
  });

  suite('PUT /api/issues/{project}', function () {
    test('Update one field on an issue', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          _id: testId,
          issue_text: 'updated text',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testId);
          done();
        });
    });

    test('Update multiple fields on an issue', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          _id: testId,
          issue_title: 'updated title',
          issue_text: 'updated text again',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testId);
          done();
        });
    });

    test('Update an issue with missing _id', function (done) {
        chai
          .request(server)
          .put('/api/issues/test')
          .send({
            issue_title: 'no id',
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: 'missing _id' });
            done();
          });
      });

    test('Update an issue with no fields to update', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          _id: testId,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: testId });
          done();
        });
    });

    test('Update an issue with an invalid _id', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          _id: 'invalidid123',
          issue_title: 'will fail',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'could not update', _id: 'invalidid123' });
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project}', function () {
    test('Delete an issue', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({ _id: testId })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { result: 'successfully deleted', _id: testId });
          done();
        });
    });

    test('Delete an issue with an invalid _id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({ _id: 'invalidid123' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'could not delete', _id: 'invalidid123' });
          done();
        });
    });

    test('Delete an issue with missing _id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'missing _id' });
          done();
        });
    });
  });
});