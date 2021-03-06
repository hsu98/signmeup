import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Roles } from 'meteor/alanning:roles';

import { Queues } from '/imports/api/queues/queues';

import '/imports/ui/components/queue-header/queue-header';
import '/imports/ui/components/alerts/alert-ending-soon/alert-ending-soon';
import '/imports/ui/components/alerts/alert-signup-gap/alert-signup-gap';
import '/imports/ui/components/queue-actions/queue-actions';
import '/imports/ui/components/queue-alert-restricted-session/queue-alert-restricted-session';
import '/imports/ui/components/queue-table/queue-table';
import '/imports/ui/components/modals/modal-queue-edit/modal-queue-edit';
import '/imports/ui/components/modals/modal-join-queue/modal-join-queue';

import './queue.html';

Template.Queue.onCreated(function onCreated() {
  this.getQueueId = () => { return FlowRouter.getParam('queueId'); };
  this.getView = () => { return FlowRouter.getQueryParam('view'); };
  this.getQueue = () => { return Queues.findOne(this.getQueueId()); };

  this.autorun(() => {
    this.subscribe('queues.byId', this.getQueueId());

    const queue = this.getQueue();
    if (queue) {
      this.subscribe('courses.byId', queue.courseId);
      this.subscribe('tickets.byQueueId', queue._id);
    }
  });
});

Template.Queue.onRendered(function onRendered() {
  this.autorun(() => {
    if (this.subscriptionsReady()) {
      const queue = this.getQueue();
      if (!queue) {
        FlowRouter.go('/404');
        return;
      }
      document.title = `(${queue.activeTickets().count()}) ${queue.course().name} · ${queue.name} · SignMeUp`; // eslint-disable-line max-len
    }
  });
});

Template.Queue.helpers({
  queue() {
    return Template.instance().getQueue();
  },

  taView() {
    if (Template.instance().getView() === 'student') {
      return false;
    }

    const queue = Template.instance().getQueue();
    const courseId = queue && queue.courseId;
    if (Roles.userIsInRole(Meteor.user(), ['admin', 'mta', 'hta', 'ta'], courseId)) {
      return true;
    }

    return false;
  },
});
