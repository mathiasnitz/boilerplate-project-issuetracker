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
      let project = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
    
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
    
      const issues = issuesData[project] || [];
      const issue = issues.find(i => i._id === _id);
    
      if (!issue) {
        return res.json({ error: 'could not update', _id });
      }
    
      const updateFields = {};
      if (issue_title) updateFields.issue_title = issue_title;
      if (issue_text) updateFields.issue_text = issue_text;
      if (created_by) updateFields.created_by = created_by;
      if (assigned_to) updateFields.assigned_to = assigned_to;
      if (status_text) updateFields.status_text = status_text;
      if (open !== undefined) updateFields.open = open;
    
      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }
    
      try {
        Object.assign(issue, updateFields);
        issue.updated_on = new Date().toISOString();
    
        return res.json({ result: 'successfully updated', _id });
      } catch (err) {
        return res.json({ error: 'could not update', _id });
      }
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      let { _id } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      const issueList = issuesData[project] || [];
      const index = issueList.findIndex(i => i._id === _id);

      if (index === -1) return res.json({ error: 'could not delete', _id });

      issueList.splice(index, 1);

      res.json({ result: 'successfully deleted', _id });
    });
    
};
