// teamwork.config.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONFIGURATION FILE.
// DO NOT modify the sections labeled "AUTO-GENERATED".
//
// Copyright (c) 2025 Smackcoders. All rights reserved.
// This file is subject to the Smackcoders Proprietary License.
// Unauthorized copying or distribution is strictly prohibited.
// -----------------------------------------------------------------------------

import { Options } from '@nestjs/common';
import { teamwork } from './teamwork.controller';

export const XappName = 'teamwork';
export const modules = [
  {
    module: 'link',
    actions: ['create', 'get', 'update', 'delete'],
    triggers: [],
  },
  {
    module: 'company',
    actions: ['create', 'get', 'getmany', 'update', 'delete'],
    triggers: [],
  },
  {
    module: 'categories',
    actions: ['create', 'get', 'getmany', 'update', 'delete'],
    triggers: [],
  },
  {
    module: 'milestone',
    actions: ['create', 'get', 'getmany', 'update', 'delete'],
    triggers: [],
  },
  {
    module: 'comments',
    actions: ['create', 'get', 'getmany', 'update', 'delete'],
    triggers: [],
  },
  {
    module: 'notebook',
    actions: ['create', 'get', 'getmany', 'update', 'delete'],
    triggers: [],
  },
  {
    module: 'notebookcategories',
    actions: ['create', 'get', 'getmany', 'update', 'delete'],
    triggers: [],
  },
  {
    module: 'person',
    actions: ['create', 'get', 'getmany', 'update', 'delete'],
    triggers: [],
  },
  {
    module: 'project',
    actions: ['create', 'get', 'getmany', 'update', 'delete'],
    triggers: [],
  },
  {
    module: 'status',
    actions: ['create', 'get', 'getmany', 'update', 'delete'],
    triggers: [],
  },
  {
    module: 'task',
    actions: ['create', 'get', 'getmany', 'update', 'delete'],
    triggers: [],
  },
  {
    module: 'invoice',
    actions: ['create', 'get', 'getmany', 'update', 'delete'],
    triggers: [],
  },
  {
    module: 'filecategories',
    actions: ['create', 'get', 'getmany', 'update', 'delete'],
    triggers: [],
  },
];

export default {
  XappName,
  modules,
};

const linkAdditionalFields = [
  {
    displayName: 'Link',
    name: 'link__notify',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Link',
    name: 'link__notify-current-user',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Link',
    name: 'link__description',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },

  {
    displayName: 'Link',
    name: 'link__category-id',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Link',
    name: 'link__width',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Link',
    name: 'link__height',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Link',
    name: 'link__tagIds',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Link',
    name: 'link__grant-access-to',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Link',
    name: 'link__private',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Link',
    name: 'link__',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Link',
    name: 'link__',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Link',
    name: 'link__',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Link',
    name: 'link__',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Link',
    name: 'link__',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
];
const companyAdditionalFields = [
  {
    displayName: 'Company',
    name: 'company__',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__addressOne',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__addressTwo',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__cid',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__city',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__clientManagedBy',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__countrycode',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__currencyId',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__customFields',
    type: 'object',
    description: 'CustomFields is the custom fields type.',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__emailOne',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__emailTwo',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__emailThree',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__fax',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__industryCatId',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__logoPendingFileRef',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },

  {
    displayName: 'Company',
    name: 'company__phone',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__privateNotes',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__profile',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__state',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__tagIds',
    type: 'array',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__website',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company',
    name: 'company__zip',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Company Options',
    name: 'companyOptions__fireWebhook',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Company Options',
    name: 'companyOptions__logActivity',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Company Options',
    name: 'companyOptions__useNotifyViaTWIM',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Tags',
    name: 'tags__color',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Tags',
    name: 'tags__name',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Tags',
    name: 'tags__projectId',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
];

const commentAdditionalFields = [
  {
    displayName: 'Comment',
    name: 'comment__notify',
    type: 'string',
    description:
      '"all" - means notify all project users. Notify "true" is for only followers.',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Comment',
    name: 'comment__isprivate',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Comment',
    name: 'comment__pendingFileAttachments',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Comment',
    name: 'comment__content-type',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
];

const notebookAdditionalFields = [
  {
    displayName: 'Notebook',
    name: 'notebook__categoryId',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },

  {
    displayName: 'Notebook',
    name: 'notebook__description',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Notebook',
    name: 'notebook__isFullWidth',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Notebook',
    name: 'notebook__isPrivate',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Notebook',
    name: 'notebook__locked',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },

  {
    displayName: 'Notebook',
    name: 'notebook__newVersion',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Notebook',
    name: 'notebook__notify',
    type: 'object',
    description: 'Notify defines the access lists.',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Notebook',
    name: 'notebook__notifyCurrentUser',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Notebook',
    name: 'notebook__privacy',
    type: 'object',
    description:
      'UserGroups are common lists for storing users, companies and teams ids together.',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Notebook',
    name: 'notebook__secureContent',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Notebook',
    name: 'notebook__sendDiff',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Notebook',
    name: 'notebook__tagIds',
    type: 'array',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Notebook',
    name: 'notebook__type',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
];
const personAdditionalFields = [
  {
    displayName: 'Person',
    name: 'person__company-id',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__sendInvite',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__title',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__phone-number-office',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__phone-number-office-ext',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__phone-number-mobile-countrycode',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__phone-number-mobile-prefix',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__phone-number-mobile',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__phone-number-home',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__phone-number-fax',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__email-alt-1',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__email-alt-2',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__email-alt-3',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__address',
    type: 'object',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__profile',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__userTwitterName',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__userLinkedin',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__userFacebook',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__userWebsite',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__im-service',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__im-handle',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__language',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__dateFormatId',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__timeFormatId',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__timezoneId',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__calendarStartsOnSunday',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__lengthOfDay',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__workingHours',
    type: 'object',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__changeForEveryone',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__administrator',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__canAddProjects',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__canManagePeople',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__autoGiveProjectAccess',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__canAccessCalendar',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__canAccessTemplates',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__canAccessPortfolio',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__canManageCustomFields',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__canManagePortfolio',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__canManageProjectTemplates',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__canViewProjectTemplates',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__notifyOnTaskComplete',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__notify-on-added-as-follower',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__notify-on-status-update',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__textFormat',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__useShorthandDurations',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__userReceiveNotifyWarnings',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Person',
    name: 'person__userReceiveMyNotificationsOnly',
    type: 'boolean',
    description: '',
    default: false,
  },
];

const projectAdditionalFields = [
  {
    displayName: 'Project',
    name: 'project__description',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__use-tasks',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__use-milestones',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__use-messages',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__use-files',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__use-time',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__use-notebook',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__use-riskregister',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__use-links',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__use-billing',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__use-comments',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__category-id',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__start-date',
    type: 'string',
    description: 'Date format: yyyymmdd',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__end-date',
    type: 'string',
    description: 'Date format: yyyymmdd',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__tagIds',
    type: 'string',
    description: 'List of Ids (comma separated) - Leave blank for no tags',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__onboarding',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__grant-access-to',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__private',
    type: 'boolean',
    description: '',
    default: false,
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__customFields',
    type: 'array',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__customFields__people',
    type: 'integer',
    description: 'List of Ids (comma separated)',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__customFields__projectOwnerId',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Project',
    name: 'project__customFields__companyId',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
];

const invoiceAdditionalFields = [
  {
    displayName: 'Invoice',
    name: 'invoice__fixed-cost',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Invoice',
    name: 'invoice__number',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Invoice',
    name: 'invoice__po-number',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Invoice',
    name: 'invoice__display-date',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Invoice',
    name: 'invoice__currency-code',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
];

const taskAdditionalFields = [
  {
    displayName: 'Task',
    name: 'task__assignees',
    type: 'object',
    description:
      'UserGroups are common lists for storing users, companies and teams ids together.',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__attachmentIds',
    type: 'array',
    description: '',
    default: '',

    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__userGroups',
    type: 'array',
    description: '',
    default: '',
    fields: [
      {
        displayName: 'User Groups',
        name: 'userGroup__companyIds',
        type: 'array',
        description: '',
        default: '',
        items: [],
        required: false,
      },
      {
        displayName: 'User Groups',
        name: 'userGroup__NullableInt64Slice',
        type: 'array',
        description: '',
        default: '',
        fields: [
          {
            displayName: '',
            name: 'NullableInt64Slice__Null',
            type: 'array',
            description: '',
            default: '',
            items: [],
            required: false,
          },
          {
            displayName: '',
            name: 'NullableInt64Slice__Set',
            type: 'array',
            description: '',
            default: '',
            items: [],
            required: false,
          },
          {
            displayName: '',
            name: 'NullableInt64Slice__Value',
            type: 'array',
            description: '',
            default: '',
            items: [],
            required: false,
          },
        ],
        items: [],
        required: false,
      },
    ],
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__changeFollowers',
    type: 'object',
    description:
      'UserGroups are common lists for storing users, companies and teams ids together.',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__commentFollowers',
    type: 'object',
    description:
      'UserGroups are common lists for storing users, companies and teams ids together.',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__completedAt',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__completedBy',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__createdAt',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__createdBy',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__crmDealIds',
    type: 'array',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__customFields',
    type: 'object',
    description: 'CustomFields is the custom fields type.',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__description',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__descriptionContentType',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__dueAt',
    type: 'object',
    description:
      'NullableDate implements json.Unmarshaler to allow testing between a value that explicitly set to null or omitted. Date format "2006-01-02"',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__estimatedMinutes',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__grantAccessTo',
    type: 'object',
    description:
      'UserGroups are common lists for storing users, companies and teams ids together.',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__hasDeskTickets',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__name',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__originalDueDate',
    type: 'object',
    description:
      'NullableDate implements json.Unmarshaler to allow testing between a value that explicitly set to null or omitted. Date format "2006-01-02"',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__parentTaskId',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__priority',
    type: 'object',
    description:
      'NullableTaskPriority implements json.Unmarshaler to allow testing between a value that explicitly set to null or omitted.',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__private',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__progress',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__reminders',
    type: 'array',
    description:
      'Reminder stores all necessary information to create a task reminder.',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__repeatOptions',
    type: 'object',
    description: 'RepeatOptions stores recurring information for the task.',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__startAt',
    type: 'object',
    description:
      'NullableDate implements json.Unmarshaler to allow testing between a value that explicitly set to null or omitted. Date format "2006-01-02"',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__status',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__tagIds',
    type: 'array',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__taskgroupId',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__tasklistId',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__templateRoleName',
    type: 'string',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Task',
    name: 'task__ticketId',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Workflows',
    name: 'workflows__positionAfterTask',
    type: 'integer',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: 'Workflows',
    name: 'workflows__stageId',
    type: 'integer',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: 'Options',
    name: 'options__appendAssignees',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Options',
    name: 'options__checkInvalidusers',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Options',
    name: 'options__everyoneMustDo',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Options',
    name: 'options__fireWebhook',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Options',
    name: 'options__isTemplate',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Options',
    name: 'options__logActivity',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Options',
    name: 'options__notify',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Options',
    name: 'options__parseInlineTags',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Options',
    name: 'options__positionAfterTaskId',
    type: 'integer',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Options',
    name: 'options__pushDependents',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Options',
    name: 'options__pushSubtasks',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Options',
    name: 'options__shiftProjectDates',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Options',
    name: 'options__useDefaults',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Options',
    name: 'options__useNotifyViaTWIM',
    type: 'boolean',
    description: '',
    default: '',
    items: [],
    required: false,
  },
  {
    displayName: 'Workflows',
    name: 'workflows__workflowId',
    type: 'integer',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },

  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
  {
    displayName: '',
    name: '',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
  },
];

export const fields = [
  {
    displayName: 'Addtional Fields',
    name: 'addtional field',
    type: 'string',
    description: 'Addtional fields for ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['link'],
        name: ['create', 'update'],
      },
    },
    fields: [linkAdditionalFields],
  },

  {
    displayName: 'Project ID',
    name: 'project_id',
    type: 'string',
    description: '',
    default: '',
    items: [],
    options: [],

    async init(data) {
      try {
        const options = await teamwork.getallProject(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['link'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'getmany',
    name: 'getmany',
    type: 'string',
    description: '',
    default: '',
    items: [],
    options: [],

    async init(data) {
      try {
        const options = await teamwork.getallLink(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['link'],
        name: ['getmany'],
      },
    },
  },

  {
    displayName: 'Link',
    name: 'link__name',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['link'],
        name: ['create', 'update'],
      },
    },
  },

  {
    displayName: 'Link',
    name: 'link__code',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['link'],
        name: ['create', 'update'],
      },
    },
  },
  {
    displayName: 'Link Id',
    name: 'Id',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    Options:[],
       async init(data) {
      try {
        const options = await teamwork.getallLink(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['link'],
        name: ['get', 'update', 'delete'],
      },
    },
  },

  //company
  {
    displayName: 'Company',
    name: 'company__name',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['company'],
        name: ['create'],
      },
    },
  },

  {
    displayName: 'getmany',
    name: 'getmany',
    type: 'string',
    description: '',
    default: '',
    items: [],
    options: [],

    async init(data) {
      try {
        const options = await teamwork.getallCompany(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['company'],
        name: ['getmany'],
      },
    },
  },

  {
    displayName: 'Addtional Fields',
    name: 'addtional field',
    type: 'string',
    description: 'Addtional fields for company ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['company'],
        name: ['create', 'update'],
      },
    },

    fields: [companyAdditionalFields],
  },
  {
    displayName: 'Company Id',
    name: 'Id',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    options: [],

    async init(data) {
      try {
        const options = await teamwork.getallCompany(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['company'],
        name: ['update', 'get', 'delete'],
      },
    },
  },

  //
  {
    displayName: 'Resource',
    name: 'resource',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['comment'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'Resource ID',
    name: 'resourceId',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['comment'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'getmany',
    name: 'getmany',
    type: 'string',
    description: '',
    default: '',
    items: [],
    options: [],

    async init(data) {
      try {
        const options = await teamwork.getallComments(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['comment'],
        name: ['getmany'],
      },
    },
  },

  {
    displayName: 'Comment',
    name: 'comment__body',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['comment'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'comment Id',
    name: 'Id',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['comment'],
        name: ['get', 'update', 'delete'],
      },
    },
  },
  {
    displayName: 'Addtional Fields',
    name: 'addtional field',
    type: 'string',
    description: 'Addtional fields for ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['commnet'],
        name: ['create', 'update'],
      },
    },
    fields: [commentAdditionalFields],
  },

  {
    displayName: 'Notebook',
    name: 'notebook__name',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['notebook'],
        name: ['create', 'update'],
      },
    },
  },

  {
    displayName: 'getmanynotebook',
    name: 'getmany',
    type: 'string',
    description: '',
    default: '',
    items: [],
    options: [],
    async init(data) {
      try {
        const options = await teamwork.getallNotebook(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['notebook'],
        name: ['getmany'],
      },
    },
  },
  {
    displayName: 'Notebook',
    name: 'notebook__contents',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['notebook'],
        name: ['create', 'update'],
      },
    },
  },
  {
    displayName: 'notebook Id',
    name: 'Id',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    options: [],
    async init(data) {
      try {
        const options = await teamwork.getallNotebook(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['notebook'],
        name: ['get', 'update', 'delete'],
      },
    },
  },
  {
    displayName: 'Addtional Fields',
    name: 'addtional field',
    type: 'string',
    description: 'Addtional fields for notebook',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['notebook'],
        name: ['create'],
      },
    },
    fields: [notebookAdditionalFields],
  },

  //

  {
    displayName: 'Category',
    name: 'actegory__name',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['notebook categories'],
        name: ['create', 'update'],
      },
    },
  },
  {
    displayName: 'Category',
    name: 'category__parent-id',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['notebook categories'],
        name: ['create', 'update'],
      },
    },
  },
  {
    displayName: 'getmany',
    name: 'getmany',
    type: 'string',
    description: '',
    default: '',
    items: [],
    options: [],

    async init(data) {
      try {
        const options = await teamwork.getAllNotebookcategories(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['notebook categories'],
        name: ['getmany'],
      },
    },
  },
  {
    displayName: 'Project ID',
    name: 'project_id',
    type: 'string',
    description: '',
    default: '',
    items: [],
    options: [],

    async init(data) {
      try {
        const options = await teamwork.getallProject(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['notebook categories'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'Notbook Category Id',
    name: 'Id',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['notebook categories'],
        name: ['get', 'update', 'delete'],
      },
    },
  },

  //person

  {
    displayName: 'Person',
    name: 'first-name',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['person'],
        name: ['create', 'update'],
      },
    },
  },
  {
    displayName: 'Person',
    name: 'last-name',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['person'],
        name: ['create', 'update'],
      },
    },
  },
  {
    displayName: 'getmany',
    name: 'getmany',
    type: 'string',
    description: '',
    default: '',
    items: [],
    options: [],

    async init(data) {
      try {
        const options = await teamwork.getallPerson(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['person'],
        name: ['getmany'],
      },
    },
  },

  {
    displayName: 'Additional Fields',
    name: 'addtional fields',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['person'],
        name: ['create', 'update'],
      },
    },
    fields: [personAdditionalFields],
  },
  {
    displayName: 'Person Id',
    name: 'Id',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    options: [],

    async init(data) {
      try {
        const options = await teamwork.getallPerson(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['person'],
        name: ['get', 'update', 'delete'],
      },
    },
  },

  // project

  {
    displayName: 'Project',
    name: 'project__name',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['project'],
        name: ['create', 'update'],
      },
    },
  },

  {
    displayName: 'Addtional Fields',
    name: 'addtional field',
    type: 'string',
    description: 'Addtional fields for ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['project'],
        name: ['create', 'update'],
      },
    },
    fields: [projectAdditionalFields],
  },

  {
    displayName: 'Project Id',
    name: 'Id',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
        options: [],

    async init(data) {
      try {
        const options = await teamwork.getallProject(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['project'],
        name: ['get', 'update', 'delete'],
      },
    },
  },

  // status
  {
    displayName: 'User Status',
    name: 'userStatus__status',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['status'],
        name: ['create', 'update'],
      },
    },
  },
  {
    displayName: 'getmany',
    name: 'getmany',
    type: 'string',
    description: '',
    default: '',
    items: [],
    options: [],

    async init(data) {
      try {
        const options = await teamwork.getallStatus(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['status'],
        name: ['getmany'],
      },
    },
  },
  {
    displayName: 'User Status',
    name: 'userStatus__notifyIds',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['status'],
        name: ['create', 'update'],
      },
    },
  },
  {
    displayName: 'User Status',
    name: 'userStatus__notify',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['status'],
        name: ['create', 'update'],
      },
    },
  },

  {
    displayName: 'status Id',
    name: 'Id',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    options: [],

    async init(data) {
      try {
        const options = await teamwork.getallStatus(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['status'],
        name: ['get', 'update', 'delete'],
      },
    },
  },
  // task

  {
    displayName: 'Task List Id',
    name: 'tasklistId',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['task'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'getmany',
    name: 'getmany',
    type: 'string',
    description: '',
    default: '',
    items: [],
    options: [],

    async init(data) {
      console.log(data);

      try {
        console.log(data);
        const options = await teamwork.getallTask(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['task'],
        name: ['getmany'],
      },
    },
  },

  {
    displayName: 'Task Id',
    name: 'Id',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
     options: [],

    async init(data) {
      console.log(data);

      try {
        console.log(data);
        const options = await teamwork.getallTask(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['task'],
        name: ['get', 'update', 'delete'],
      },
    },
  },
  {
    displayName: 'Task',
    name: 'task__name',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['task'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'Additional Fields',
    name: 'addtional fields',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['task'],
        name: ['create'],
      },
    },
    fields: [taskAdditionalFields],
  },

  // invoice

  {
    displayName: 'Additional fields',
    name: 'addtional fields',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['invoice'],
        name: ['update'],
      },
    },

    fields: [invoiceAdditionalFields],
  },

  {
    displayName: 'getmany',
    name: 'getmany',
    type: 'string',
    description: 'unique identifier of the project',
    default: '',
    items: [],
    options: [],

    async init(data) {
      try {
        const options = await teamwork.getallFilecategories(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['filecategories'],
        name: ['getmany'],
      },
    },
  },

  {
    displayName: 'Invoice',
    name: 'invoice__description',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['invoice'],
        name: ['create', 'update'],
      },
    },
  },
  {
    displayName: 'Invoice ID',
    name: 'Id',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    options: [],

    async init(data) {
      try {
        const options = await teamwork.getallInvoice(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['get', 'update', 'delete'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'Category',
    name: 'category__name',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['file categories'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'Category',
    name: 'category__parent-id',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ['file categories'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'file categories Id',
    name: 'Id',
    type: 'string',
    description: ' ',
    default: '',
    items: [],
    options: [],

    async init(data) {
      try {
        const options = await teamwork.getallFilecategories(data);
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ['file categories'],
        name: ['get', 'update', 'delete'],
      },
    },
  },
];
