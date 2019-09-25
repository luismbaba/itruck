function getDate(date){
		if (typeof date === 'undefined' || date === null ||  date === '' ) {
			return null;
		} 
		return new Date(date);
}