import request from '@/utils/request'

export function contentList(id=null) {
    if (id == null){
        return request({
            url: '/content',
            method: 'get',
          }) 
    }
    else {
        return request({
            url: `/content/${id}`,
            method: 'get',
          }) 
    }
  }
