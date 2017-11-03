import * as Errors from '../errors';
import * as bugsModel from '../bugs/model';

export interface TargetIds {
  [targetType: string]: {
    [userId: number]: number[];
  };
}

export function validateTargetIds(targetIds: TargetIds): Promise<void> {
  let ps = [];
  for (let targetType in targetIds) {
    let m;
    if (targetType === 'bugs') {
      m = bugsModel;
    } else {
      return Promise.reject(new Errors.InvalidArgumentsError('Invalid targetType'));
    }

    for (let userId in targetIds[targetType]) {
      const ids = targetIds[targetType][userId];
      let p = m.index({id: ids, user_id: userId}, [], {fields: {[targetType]: 'id'}})
      .then(xs => {
        if (xs.length !== ids.length) throw new Errors.ForbiddenError();
      });
      ps.push(p);
    }
  }

  return Promise.all(ps).then(() => {});
}

export function groupTargetIds(items, userIdKey = 'user_id', targetTypeKey = 'target_type', targetIdKey = 'target_id'): TargetIds {
  let targetIds = {};
  for (let item of items) {
    const targetType = item[targetTypeKey];
    const userId = item[userIdKey];
    const targetId = item[targetIdKey];

    if (targetType === 'users' && targetId === userId) continue;
    
    if (!targetIds[targetType]) targetIds[targetType] = {};
    if (!targetIds[targetType][userId]) targetIds[targetType][userId] = [];
    targetIds[targetType][userId].push(targetId);
  }
  return targetIds;
}
