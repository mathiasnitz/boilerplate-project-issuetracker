'use strict';

const issuesData = {};
let nextId = 1;

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      const filters = req.query;

      let issues = issuesData[project] || [];

      issues = issues.filter(issue => {
        for (let key in filters) {
          if (key === 'open') {
            if (String(issue.open) !== filters[key]) return false;
          } else {
            if (issue[key] !== filters[key]) return false;
          }
        }
        return true;
      });
      
      res.json(issues);
    })
    
    .post(function (req, res){
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = {
        _id: nextId.toString(),
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        open: true
      };

      if (!issuesData[project]) issuesData[project] = [];
      issuesData[project].push(newIssue);

      nextId++;

      res.json(newIssue);
    })
    
    .put(function (req, res) {
      const project = req.params.project;
      const { _id, ...fields } = req.body;

      if (!_id) {
        return res
          .type('application/json')
          .send(JSON.stringify({ error: 'missing _id', _id: undefined }));
      }

      const issueList = Array.isArray(issuesData[project]) ? issuesData[project] : [];
      const issue = issueList.find(i => i._id === _id);

      if (!issue) {
        return res.json({ error: 'could not update', '_id': _id });
      }

      const updateKeys = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open'];
      const hasUpdates = updateKeys.some(key => fields[key] !== undefined && fields[key] !== '');
    
      if (!hasUpdates) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }

      updateKeys.forEach(key => {
        if (fields[key] !== undefined && fields[key] !== '') {
          if (key === 'open') {
            issue[key] = fields[key] === 'false' ? false : true;
          } else {
            issue[key] = fields[key];
          }
        }
      });

      issue.updated_on = new Date().toISOString();
    
      return res.json({ result: 'successfully updated', '_id': _id });
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      const { _id } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      const issueList = issuesData[project] || [];
      const index = issueList.findIndex(i => i._id === _id);

      if (index === -1) return res.json({ error: 'could not delete', _id });

      issueList.splice(index, 1);

      res.json({ result: 'successfully deleted', _id });
    });
    
};
