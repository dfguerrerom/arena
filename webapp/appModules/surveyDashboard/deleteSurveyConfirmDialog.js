import './deleteSurveyConfirmDialog.scss'

import React from 'react'

import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from '../../commonComponents/modal'

export default class DeleteSurveyConfirmDialog extends React.Component {
  constructor (props) {
    super(props)

    this.state = {confirmName: ''}
    this.confirmNameChanged = this.confirmNameChanged.bind(this)
  }

  componentDidMount () {
    this.setState({confirmName: ''})
    this.nameInput.focus()
  }

  confirmNameChanged (event) {
    this.setState({confirmName: event.target.value})
  }

  render () {
    const {surveyName, onDelete, onCancel} = this.props

    return (
      <Modal isOpen={true}>
        <ModalHeader>
          <h5 className="survey-delete-dialog__header">Are you sure you want to delete this?</h5>
        </ModalHeader>

        <ModalBody>
          <div className="survey-delete-dialog__body">
            <div className="highlight">
              Deleting the <b>{surveyName}</b> survey will delete all of its data.
            </div>

            <div className="text-center">
              Enter this survey’s name to confirm:
            </div>

            <input type="text"
                   className="confirm-name"
                   value={this.state.confirmName}
                   onChange={this.confirmNameChanged}
                   ref={input => this.nameInput = input}/>
          </div>
        </ModalBody>

        <ModalFooter>
          <div>
            <button className="btn btn-of modal-footer__item"
                    onClick={onCancel}
                    aria-disabled={false}>
              <span className="icon icon-cross icon-12px icon-left"/>
              Cancel
            </button>

            <button className="btn btn-of btn-danger modal-footer__item"
                    onClick={onDelete}
                    aria-disabled={!(surveyName === this.state.confirmName)}>
              <span className="icon icon-bin icon-12px icon-left"/>
              Delete
            </button>
          </div>
        </ModalFooter>
      </Modal>
    )
  }
}
