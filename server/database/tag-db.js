var dbConfig = require(__base + 'secret/config-db.json');
var MariaSql = require('mariasql');
var bluebird = require('bluebird');

var TagDB = {
	getTags() {	
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));	
		const query = (
			'SELECT DISTINCT t.tag_text AS tag FROM TAGS t ' +
			'JOIN USER_TAGS ut ON t.tag_id = ut.tag_id ' +
			'WHERE ut.user_id = :userId ' + 
			'ORDER BY tag_text'
		)
		return connection.queryAsync(query, {userId: 1}, {useArray: true}).then(rows => {
			connection.end()
			return rows.map(row => row[0])			
		})
	},

	getTagsForMessage(messageId) {
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));	
		const query = (
			'SELECT DISTINCT t.tag_text AS tag FROM TAGS t ' +
			'JOIN LINKS_TAGS lt ON t.tag_id = lt.tag_id ' + 
			'JOIN LINKS l ON lt.link_id = l.link_id ' + 
			'JOIN MESSAGE m ON l.link_id = m.link_id ' + 
			'WHERE m.message_id = :messageId'
		)
		return connection.queryAsync(query, {messageId: messageId}, {useArray: true}).then(rows => {
			connection.end()
			return rows.map(row => row[0]);
		})
		
	},

	addTags(messageId, tags) {
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));	

		const promiseTags = tags.map(tag => {
			// insert tag
			// hook tag to message
			// hook tag to user
			const getTag = "SELECT tag_id FROM TAGS WHERE tag_text = :tagText"
			const insertTag = "INSERT INTO TAGS (tag_text) VALUES (:tagText)"
			const getLink = "SELECT link_id FROM MESSAGE WHERE message_id = :messageId"
			const insertTagLink = "INSERT INTO LINKS_TAGS (link_id, tag_id) VALUES (:linkId, :tagId)"
			const insertTagUser = "INSERT INTO USER_TAGS (user_id, tag_id) VALUES (:userId, :tagId)"
			
			
			return connection.queryAsync(insertTag, {tagText: tag}, {useArray: true}).then(() => {
				return connection.lastInsertId()
			}).then(tagId => {
				return connection.queryAsync(getLink, {messageId: messageId}, {useArray: true}).then(rows => {
					if (rows && rows.length) {
						const linkId = rows[0]
						return {
							tagId: tagId,
							linkId: linkId
						}						
					} 
					return {}
				})
			}).then(linkAndTag => {
				const link = linkAndTag.linkId
				const tag = linkAndTag.tagId

				if (link && tag) {
					connection.queryAsync(insertTagLink, {linkId: link, tagId: tag})
					connection.queryAsync(insertTagUser, {userId: 1, tagId: tag})
				}				
			})
		})

		return Promise.all(promiseTags).then(() => connection.end())
	}
}

module.exports = function (connection) {
	var tagDB = Object.create(TagDB);
	tagDB._connection = connection;
	return tagDB;
}
