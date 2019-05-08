<template>
  <div class="app-container">
    <div class="form-container">
    <el-form ref="postForm" :model="postForm" :rules="rules">
      
    <el-row>
      <el-col :span="16">
        <div class="content-container">
        <el-form-item label="Title" prop="title">
          <el-input v-model="postForm.title" name="name" :maxlength="100" required/>
        </el-form-item>
          <!-- <Warning /> -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="Author:" class="postInfo-container-item">
              <el-select v-model="postForm.author" :remote-method="getRemoteUserList" filterable remote placeholder="Search user">
                <el-option v-for="(item,index) in userListOptions" :key="item+index" :label="item" :value="item"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Important Rate:">
            <el-rate
              v-model="postForm.importance"
              :max="3"
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              :low-threshold="1"
              :high-threshold="3"
              style="margin-top:8px;"/>
            </el-form-item>
          </el-col> 
        </el-row>
        <el-form-item label="Content: " prop="content">
          <el-input :rows="1" v-model="postForm.content" 
                  type="textarea"
                  class="article-textarea" 
                  placeholder="Short Content"
                  :autosize="{ minRows: 8, maxRows: 8}" />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }} Characters</span>
        </el-form-item>


        <el-form-item prop="image_uri" >
          <Upload v-model="postForm.image_uri" />
        </el-form-item>
        </div>
      </el-col>
      <el-col :span="8">
        <el-col :span="24">
          <el-row>
            <div class="content-action">

                <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
                  Publish
                </el-button>
                <el-button v-loading="loading" type="warning" @click="draftForm">
                  Draft
                </el-button>

               <el-form-item  label="Publish on:">
                <el-date-picker v-model="postForm.display_time" 
                    type="datetime" 
                    format="HH:mm:ss dd-MM-yyyy" 
                    placeholder="Select Date Time"/>
              </el-form-item>

            </div>
          </el-row>
          
        </el-col>

      </el-col>
      
      </el-row>
    </el-form>
    </div>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import TextAreaEmojiPicker from '@/components/TextAreaEmojiPicker'
import Upload from '@/components/Upload/singleImage3'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { validURL } from '@/utils/validate'
import { contentList } from '@/api/content'
import { searchUser } from '@/api/user'
// import Warning from './Warning'
// import { CommentDropdown, PlatformDropdown, SourceUrlDropdown } from './Dropdown'

const defaultForm = {
  status: 'draft',
  title: '', // 文章题目
  content: '', // 文章内容
  source_uri: '', // 文章外链
  image_uri: '', // 文章图片
  display_time: undefined, // 前台展示时间
  id: undefined,
  platforms: ['a-platform'],
  comment_disabled: false,
  importance: 3
}

export default {
  name: 'content-detail',
  components: { Tinymce, MDinput, Upload, Sticky, TextAreaEmojiPicker},
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + ' is required',
          type: 'error'
        })
        callback(new Error(rule.field + ' is required'))
      } else {
        callback()
      }
    }
    const validateSourceUri = (rule, value, callback) => {
      if (value) {
        if (validURL(value)) {
          callback()
        } else {
          this.$message({
            message: 'Is not correct',
            type: 'error'
          })
          callback(new Error('Url is not correct'))
        }
      } else {
        callback()
      }
    }
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      rules: {
        image_uri: [{ validator: validateRequire }],
        title: [{ validator: validateRequire }],
        source_uri: [{ validator: validateSourceUri, trigger: 'blur' }]
      },
      tempRoute: {}
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.content.length
    },
    lang() {
      return this.$store.getters.language
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    } else {
      this.postForm = Object.assign({}, defaultForm)
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      contentList(id).then(response => {
        this.postForm = response.data
        // Just for test
        // this.postForm.title += `   Article Id:${this.postForm.id}`
        // this.postForm.content_short += `   Article Id:${this.postForm.id}`

        // Set tagsview title
        this.setTagsViewTitle()
      }).catch(err => {
        console.log(err)
      })
    },
    setTagsViewTitle() {
      const title = this.lang === 'zh' ? '编辑文章' : 'Edit Article'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id}` })
      this.$store.dispatch('updateVisitedView', route)
    },
    submitForm() {
      this.postForm.display_time = parseInt(this.display_time / 1000)
      console.log(this.postForm)
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$notify({
            title: 'Content',
            message: 'Successful',
            type: 'success',
            duration: 2000
          })
          this.postForm.status = 'published'
          this.loading = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    draftForm() {
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: 'Please fill out the necessary title and content',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: 'Successfully Saved',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.postForm.status = 'draft'
    },
    getRemoteUserList(query) {
      searchUser(query).then(response => {
        console.log(response)
        if (!response.data) return
        this.userListOptions = response.data.map(v => v.username)
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "~@/styles/mixin.scss";

.app-container {
  padding: 20px;
  .form-container {
    border: 1px solid #ced4da;
    box-shadow: 0 5px 20px -15px black;
    .el-form{
      .content-container{
        border-right: 1px solid #ced4da;
        padding: 10px;
      //     .article-textarea {
      //       width: 100%;
      //       min-height: 300px;
      //       outline: none;
      //       box-shadow: none;
      //       padding: 10px 28px 10px 10px;
      //       font-size: 15px;
      //       border: 1px solid #ced4da;
      //       color: #333;
      //       border-radius: 2px;
      //       box-shadow: 0px 2px 4px 0 rgba(20, 16, 16, 0.1) inset;
      //     resize: vertical;
      // }
      }
      .content-action{
        padding: 10px;
      }
      
    }
  }
  .group-btn {
    float: right;
    padding: 5px;
  }
  
}
</style>
