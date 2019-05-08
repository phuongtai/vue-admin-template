import request from '@/utils/request'


export function login(data) {
  console.log(data)
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function getUserInfo(user_id, token) {
  return request({
    url: `/user/${user_id}`,
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}


export function searchUser() {
  return request({
    url: '/user/search',
    method: 'get'
  })
}

