import React from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import { Link } from 'react-router-dom';
import { Table, Alert, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';

import DocumentsCollection from '../../../api/Documents/Documents';
import { timeago, monthDayYearAtTime } from '../../../modules/dates';
import Loading from '../../misc/Loading/Loading';

import './DocumentsList.scss';


class DocumentsList extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }


  handleRemove(documentId) {
    if (confirm('Are you sure? This is permanent!')) {
      Meteor.call('documents.remove', documentId, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Document deleted!', 'success');
        }
      });
    }
  }


  handleNew() {
    const { history } = this.props;

    const doc = {
      title: "Set me",
      body: "Set me",
    }
    Meteor.call('documents.insert', doc, (error, docId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        history.push('documents/' + docId);
      }
    });
  }


  render() {
    const { loading, documents, match, history, } = this.props;
    return (!loading ? (
      <div className="Documents">
        <div className="page-header clearfix">
          <h4 className="pull-left">Documents</h4>
          <Button className="btn-success pull-right" onClick={this.handleNew}>Add Document</Button>
        </div>
        {documents.length ?
          <Table responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Last Updated</th>
                <th>Created</th>
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {documents.map(({
                _id, title, createdAt, updatedAt,
              }) => (
                <tr key={_id}>
                  <td>{title}</td>
                  <td>{timeago(updatedAt)}</td>
                  <td>{monthDayYearAtTime(createdAt)}</td>
                  <td>
                    <Button
                      bsStyle="primary"
                      onClick={() => history.push(`${match.url}/${_id}`)}
                      block
                    >
                      View
                    </Button>
                  </td>
                  <td>
                    <Button
                      bsStyle="danger"
                      onClick={() => this.handleRemove(_id)}
                      block
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table> : <Alert bsStyle="warning">No documents yet!</Alert>}
      </div>
    ) : <Loading />);
  }
}


DocumentsList.propTypes = {
  loading: PropTypes.bool.isRequired,
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};


export default withTracker(() => {
  const subscription = Meteor.subscribe('documents');
  return {
    loading: !subscription.ready(),
    documents: DocumentsCollection.find().fetch(),
  };
})(DocumentsList);
